import { HttpException, HttpStatus, Injectable, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Achievement, UserStatus } from '@prisma/client';
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from './dto';
import { S3 } from 'aws-sdk';
import crypto = require('crypto');
import { log } from 'console';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService, private config: ConfigService){
    }
    async change_username(user : UserDto, new_username : string, @Res() res){
        try{
            console.log(new_username);
            
            await this.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        username: new_username,
                    }
            });
            res.json({message: "success!"});
        }
        catch{
            throw new HttpException("Error while updating username", HttpStatus.BAD_REQUEST);
        }
    }
    async get_user_score(user_obj : UserDto, @Res() res){
        try{
            const user = await this.get_user(user_obj.id);
            const win : number = user.win;
            const lose : number = user.lose;
            let score : number = 0;
            const winrate = win / (win + lose) * 100;
            if (winrate >= 80){
                score = (win * 300) - (lose * 100) + 1000;
            }
            else if (winrate >= 60){
                score = (win * 300) - (lose * 100) + 500;
            }
            else if (winrate >= 50){
                score = (win * 300) - (lose * 100) + 200;
            }
            else{
                score = (win * 300) - (lose * 100);
            }
            res.json((await this.update_user_score(user, score)).score);
        }
        catch{
            throw new HttpException("Error while updating score", HttpStatus.BAD_REQUEST);
        }
    }
    async get_user(req_id: string){
        const user = await this.prisma.user.findUnique({
            where:{
                id : req_id,
            }
        });
        return user;
    }
    async update_user_score(user, score : number){
        try{
            const updated_user = await this.prisma.user.update({
                where: {id: user.id },
                data: {
                    score: score,
                }
              });
            return updated_user;
        }
        catch{
            throw new HttpException("Error while updating score", HttpStatus.BAD_REQUEST);
        }
    }
    async update_user_achievements(user, achievement : Achievement){
        try{
            if (!user.achievements.includes(achievement)){
                const updated_user = await this.prisma.user.update({
                    where: {id: user.id },
                    data: {
                        achievements: {
                            push: achievement,
                        }
                    }
                  });
                return updated_user;
            }
            return user;
        }
        catch{
            throw new HttpException("Error while updating achievements", HttpStatus.BAD_REQUEST);
        }
    }
    async edit_user_status(user : UserDto, status : UserStatus){
        await this.prisma.user.update({
            where: {id: user.id },
            data: {
                status: status,
            }
          });
    }
    async get_user_achievements(user_obj : UserDto, @Res() res){
        try{
            let user = await this.get_user(user_obj.id);
            const winrate = user.win / (user.win + user.lose) * 100;
            if(user.win_streak >= 10){
                user = await this.update_user_achievements(user, Achievement.TEN_WIN_STREAK);
            }
            else if (user.win_streak >= 5){
                user = await this.update_user_achievements(user, Achievement.FIVE_WIN_STREAK);
            }
            if (winrate >= 80){
                user = await this.update_user_achievements(user, Achievement.LEGEND_WIRATE);
            }
            else if (winrate >= 60){
                user = await this.update_user_achievements(user, Achievement.GREAT_WIRATE);
            }
            else if (winrate >= 50){
                user = await this.update_user_achievements(user, Achievement.DECENT_WIRATE);
            }
            else{
                user = await this.update_user_achievements(user, Achievement.GREAT_LOSER);
            }
            res.json(user.achievements);
        }
        catch{
            throw new HttpException("Error while updating achievements", HttpStatus.BAD_REQUEST);
        }
    }
    async get_leaderboard(@Res() res){
        try{
            const users = await this.prisma.user.findMany({
                orderBy: {
                    score: 'desc',
                },
                take: 10,
            });
            // for(let i = 0; i < users.length; i++){
            //     console.log(users[i].score, users[i].username);
            // }
            res.json(users);
        }
        catch{
            throw new HttpException('Error while getting leaderboard', HttpStatus.BAD_REQUEST);
        }
    }
    async add_friend(user : UserDto, friend_name : string, @Res() res){
            const nb_user : number = await this.prisma.user.count({
                where:{
                    username: friend_name,
                }
            });
            if (nb_user == 0){
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            else if (nb_user == 1){
                const friend = await this.prisma.user.findFirst({
                    where: {
                        username : friend_name,
                    }
                });
                const user_friends = await this.prisma.user.findUnique({
                    where: {
                        id: user.id,
                    },
                    select: {
                        friends: true,
                    }
                });
                for (let i = 0; i < user_friends.friends.length; i++){
                    if (user_friends.friends[i].username == friend_name){
                        throw new HttpException('Friend already added', HttpStatus.BAD_REQUEST);
                    }
                }
                const updated_user = await this.prisma.user.update({
                    where: {id: user.id },
                    include: {friends : true},
                    data: {
                        friends: {
                            connect: {
                                id: friend.id,
                            }
                        }
                    },
                });
                res.json({message: 'success'});
            }
    }
    async upload(user_obj : UserDto, file) {
        try{
            const user = await this.get_user(user_obj.id);
            const { originalname } = file;
            const bucketS3 = this.config.get('AWS_BUCKET_NAME');;
            return ((await this.uploadS3(user, file.buffer, bucketS3, originalname)));
        }
        catch{
            throw new HttpException('Error while uploading image', HttpStatus.BAD_REQUEST);
        }

    }
    async uploadS3(user, file, bucket, name) {
        const s3 = this.getS3();
        const generateFileName = ((bytes = 15) => crypto.randomBytes(bytes).toString('hex'));
        const fileName : string = generateFileName() + name;

    //     const sharp = require('sharp');
    //     const fileBuffer = await sharp(file)
    // .resize({ height: 1920, width: 1080, fit: "contain" })
    // .toBuffer()

        var params = {
            Bucket: bucket,
            Key: fileName,
            ContentEncoding: 'base64',
            ContentDisposition: 'inline',
            ContentType: 'image/jpeg' || 'image/png' || 'image/jpg' || 'image/gif',
            Body: file,
        };

        // return new Promise((resolve, reject) => {
        //     s3.upload(params, (err, data) => {
        //         if (err) {
        //             Logger.error(err);
        //             reject(err.message);
        //         }
        //         resolve(data);
        //         this.upload_avatar(user, data.Location, bucket, s3, data.Key);
        //     });
            
        // });
        try{
            let data = await s3.upload(params).promise();
            await this.upload_avatar(user, data.Location, bucket, s3, data.Key);
            return data;
        }
        catch(err){
            Logger.error(err);
            // throw err.message;
            throw new HttpException('Error while uploading image', HttpStatus.BAD_REQUEST);
        }
    }
    getS3() {
        return new S3({
            accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
        });
    }
    async upload_avatar(user, avatar_link : string, bucket, s3, data_key : string){
        const old_avatar_key = user.avatar_key;
        
        await this.prisma.user.update({
            where: {id: user.id },
            data: {
                avatar: avatar_link,
                avatar_key: data_key,
            }
          });
        if (old_avatar_key != null){
            var params = { Bucket: bucket, Key: old_avatar_key };  
            s3.deleteObject(params, function(err, data) {
            if (err) console.log(err, err.stack);  // error
            else     console.log();                 // deleted
            });
        }
    }
    async get_user_friends(user : UserDto, @Res() res){
        try{
            const user_friends = await this.prisma.user.findUnique({
                where: {
                    id: user.id,
                },
                select: {
                    friends: true,
                }
            });
            res.json(user_friends.friends);
        }
        catch{
            throw new HttpException('Error while getting friends', HttpStatus.BAD_REQUEST);
        }
    }
}

// "Action": [
//     "s3:AbortMultipartUpload",
//     "s3:PutObject",
//     "s3:GetObject",
//     "s3:DeleteObject"
// ],