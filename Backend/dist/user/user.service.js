"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const dto_1 = require("./dto");
const aws_sdk_1 = require("aws-sdk");
const crypto = require("crypto");
let UserService = class UserService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async change_username(user, new_username, res) {
        try {
            console.log(new_username);
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    username: new_username,
                }
            });
            res.json({ message: "success!" });
        }
        catch (_a) {
            throw new common_1.HttpException("Error while updating username", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async get_user_score(user_obj, res) {
        try {
            const user = await this.get_user(user_obj.id);
            const win = user.win;
            const lose = user.lose;
            let score = 0;
            const winrate = win / (win + lose) * 100;
            if (winrate >= 80) {
                score = (win * 300) - (lose * 100) + 1000;
            }
            else if (winrate >= 60) {
                score = (win * 300) - (lose * 100) + 500;
            }
            else if (winrate >= 50) {
                score = (win * 300) - (lose * 100) + 200;
            }
            else {
                score = (win * 300) - (lose * 100);
            }
            res.json((await this.update_user_score(user, score)).score);
        }
        catch (_a) {
            throw new common_1.HttpException("Error while updating score", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async get_user(req_id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: req_id,
            }
        });
        return user;
    }
    async update_user_score(user, score) {
        try {
            const updated_user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    score: score,
                }
            });
            return updated_user;
        }
        catch (_a) {
            throw new common_1.HttpException("Error while updating score", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async update_user_achievements(user, achievement) {
        try {
            if (!user.achievements.includes(achievement)) {
                const updated_user = await this.prisma.user.update({
                    where: { id: user.id },
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
        catch (_a) {
            throw new common_1.HttpException("Error while updating achievements", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async edit_user_status(user, status) {
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                status: status,
            }
        });
    }
    async get_user_achievements(user_obj, res) {
        try {
            let user = await this.get_user(user_obj.id);
            const winrate = user.win / (user.win + user.lose) * 100;
            if (user.win_streak >= 10) {
                user = await this.update_user_achievements(user, client_1.Achievement.TEN_WIN_STREAK);
            }
            else if (user.win_streak >= 5) {
                user = await this.update_user_achievements(user, client_1.Achievement.FIVE_WIN_STREAK);
            }
            if (winrate >= 80) {
                user = await this.update_user_achievements(user, client_1.Achievement.LEGEND_WIRATE);
            }
            else if (winrate >= 60) {
                user = await this.update_user_achievements(user, client_1.Achievement.GREAT_WIRATE);
            }
            else if (winrate >= 50) {
                user = await this.update_user_achievements(user, client_1.Achievement.DECENT_WIRATE);
            }
            else {
                user = await this.update_user_achievements(user, client_1.Achievement.GREAT_LOSER);
            }
            res.json(user.achievements);
        }
        catch (_a) {
            throw new common_1.HttpException("Error while updating achievements", common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async get_leaderboard(res) {
        try {
            const users = await this.prisma.user.findMany({
                orderBy: {
                    score: 'desc',
                },
                take: 10,
            });
            res.json(users);
        }
        catch (_a) {
            throw new common_1.HttpException('Error while getting leaderboard', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async add_friend(user, friend_name, res) {
        const nb_user = await this.prisma.user.count({
            where: {
                username: friend_name,
            }
        });
        if (nb_user == 0) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        else if (nb_user == 1) {
            const friend = await this.prisma.user.findFirst({
                where: {
                    username: friend_name,
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
            for (let i = 0; i < user_friends.friends.length; i++) {
                if (user_friends.friends[i].username == friend_name) {
                    throw new common_1.HttpException('Friend already added', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const updated_user = await this.prisma.user.update({
                where: { id: user.id },
                include: { friends: true },
                data: {
                    friends: {
                        connect: {
                            id: friend.id,
                        }
                    }
                },
            });
            res.json({ message: 'success' });
        }
    }
    async upload(user_obj, file) {
        try {
            const user = await this.get_user(user_obj.id);
            const { originalname } = file;
            const bucketS3 = this.config.get('AWS_BUCKET_NAME');
            ;
            return ((await this.uploadS3(user, file.buffer, bucketS3, originalname)));
        }
        catch (_a) {
            throw new common_1.HttpException('Error while uploading image', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async uploadS3(user, file, bucket, name) {
        const s3 = this.getS3();
        const generateFileName = ((bytes = 15) => crypto.randomBytes(bytes).toString('hex'));
        const fileName = generateFileName() + name;
        var params = {
            Bucket: bucket,
            Key: fileName,
            ContentEncoding: 'base64',
            ContentDisposition: 'inline',
            ContentType: 'image/jpeg' || 'image/png' || 'image/jpg' || 'image/gif',
            Body: file,
        };
        try {
            let data = await s3.upload(params).promise();
            await this.upload_avatar(user, data.Location, bucket, s3, data.Key);
            return data;
        }
        catch (err) {
            common_1.Logger.error(err);
            throw new common_1.HttpException('Error while uploading image', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getS3() {
        return new aws_sdk_1.S3({
            accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
        });
    }
    async upload_avatar(user, avatar_link, bucket, s3, data_key) {
        const old_avatar_key = user.avatar_key;
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                avatar: avatar_link,
                avatar_key: data_key,
            }
        });
        if (old_avatar_key != null) {
            var params = { Bucket: bucket, Key: old_avatar_key };
            s3.deleteObject(params, function (err, data) {
                if (err)
                    console.log(err, err.stack);
                else
                    console.log();
            });
        }
    }
    async get_user_friends(user, res) {
        try {
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
        catch (_a) {
            throw new common_1.HttpException('Error while getting friends', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
__decorate([
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, String, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "change_username", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "get_user_score", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "get_user_achievements", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "get_leaderboard", null);
__decorate([
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, String, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "add_friend", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], UserService.prototype, "get_user_friends", null);
UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map