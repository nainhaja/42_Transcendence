import { ConfigService } from '@nestjs/config';
import { Achievement, UserStatus } from '@prisma/client';
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from './dto';
import { S3 } from 'aws-sdk';
export declare class UserService {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    change_username(user: UserDto, new_username: string, res: any): Promise<void>;
    get_user_score(user_obj: UserDto, res: any): Promise<void>;
    get_user(req_id: string): Promise<import(".prisma/client").User>;
    update_user_score(user: any, score: number): Promise<import(".prisma/client").User>;
    update_user_achievements(user: any, achievement: Achievement): Promise<any>;
    edit_user_status(user: UserDto, status: UserStatus): Promise<void>;
    get_user_achievements(user_obj: UserDto, res: any): Promise<void>;
    get_leaderboard(res: any): Promise<void>;
    add_friend(user: UserDto, friend_name: string, res: any): Promise<void>;
    upload(user_obj: UserDto, file: any): Promise<S3.ManagedUpload.SendData>;
    uploadS3(user: any, file: any, bucket: any, name: any): Promise<S3.ManagedUpload.SendData>;
    getS3(): S3;
    upload_avatar(user: any, avatar_link: string, bucket: any, s3: any, data_key: string): Promise<void>;
    get_user_friends(user: UserDto, res: any): Promise<void>;
}
