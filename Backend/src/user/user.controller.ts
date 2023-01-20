import { Body, Controller, Get, Post, Put, Param, Req, UseGuards, Res, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Patch, Query, Header } from '@nestjs/common';
import { FortyTwoGuard, JwtGuard } from 'src/auth/guard';
import { LocalAuthGuard } from './guard';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as cors from 'cors';

@ApiTags('user')
@UseGuards(LocalAuthGuard)
@Controller('user')
export class UserController {
    constructor(private prisma: PrismaService,private userService: UserService){}

    @UseGuards(JwtGuard)
    @Get('/')
    signin(@Req() req){
        this.userService.edit_user_status(req.user_obj, UserStatus.ON);
        return req.user_obj;
    }

    @UseGuards(JwtGuard)
    @Post('edit_username/:new_username')
    change_username(@Req() req, @Param('new_username') new_username : string, @Res() res){
        console.log("here");
        // this.userService.get_user(req.id);
        return this.userService.change_username(req.user_obj, new_username, res);
    }
    
    @UseGuards(JwtGuard)
    @Post('add_friend/:friend_name')
     async  add_friend(@Req() req, @Param() param, @Res() res){
        const new_user = await this.prisma.user.findUnique({
            where: {
                id : req.user_obj.id
            },
        })
        return this.userService.add_friend(new_user, param.friend_name, res);
    }

    @UseGuards(JwtGuard)
    @Get('user/:whichone')
    async get_which_one(@Req() req, @Param() param, @Res() res)
    {
        const new_user = await this.prisma.user.findUnique({
            where: {
                id : req.user_obj.id
            },
        })
        return this.userService.get_which_friend(new_user, param.whichone ,res);
    }

    @UseGuards(JwtGuard)
    @Post('upload/')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@Req() req, @UploadedFile(
        new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: '.(png|jpeg|jpg|gif|svg|bmp|webp)',
        })
        .addMaxSizeValidator({
            maxSize: 10 * 1000000,
        })
        .build({
        errorHttpStatusCode: HttpStatus.UNAUTHORIZED,
        }),
    ) file,) {
        let file_name = file.originalname;
        console.log(file_name);
        return await this.userService.upload(req.user_obj, file);
    }
    @UseGuards(JwtGuard)
    @Get('username')
    get_username(@Req() req, @Res() res){
        return this.userService.get_username(req.user_obj, res);
    }


    @UseGuards(JwtGuard)
    @Get('user')
    get_user(@Query() query, @Req() req, @Res() res){     
        return this.userService.get_user_all(req.user_obj, res);
    }
 
    @UseGuards(JwtGuard)
    @Get('user_score')
    get_user_score(@Req() req, @Res() res){
        return this.userService.get_user_score(req.user_obj, res);
    }

    @UseGuards(JwtGuard)
    @Get('logout')
    logout(@Req() req, @Res({ passthrough: true }) res){
        this.userService.edit_user_status(req.user_obj, UserStatus.OFF);
        res.clearCookie('access_token');
    }

    @UseGuards(JwtGuard)
    @Post('in_queue')
    edit_user_status(@Req() req){
        return this.userService.edit_user_status(req.user_obj, UserStatus.INQUEUE);
    }

    @UseGuards(JwtGuard)
    @Get('achievements')
    @Header('Access-Control-Allow-Origin', '*')
    get_user_achievements(@Req() req, @Res() res){
        return this.userService.get_user_achievements(req.user_obj, res);
    }

    @UseGuards(JwtGuard)
    @Get('leaderboard')
    get_leaderboard(@Res() res){
        return this.userService.get_leaderboard(res);
    }

    @UseGuards(JwtGuard)
    @Get('friends')
    get_user_friends(@Req() req, @Res() res){
        return this.userService.get_user_friends(req.user_obj, res);
    }





















 


    // edit username: DONE!
    // edit avatar: DONE!
    // leaderboard: DONE!
    // history games: DEPENDS ON GAME
    // achievements: DONE!
    // add friends: DONE!
    // stats of friends: DONE!
    // calcul of score: DONE!


    //add friend in both relations && post req
}

function Use(arg0: (req: cors.CorsRequest, res: { statusCode?: number; setHeader(key: string, value: string): any; end(): any; }, next: (err?: any) => any) => void) {
    throw new Error('Function not implemented.');
}
