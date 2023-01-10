import { Achievement, User, UserStatus } from "@prisma/client";
export declare class UserDto {
    id: string;
    full_name: string;
    username: string;
    avatar: string;
    is_two_fa_enable: boolean;
    two_fa_code: string;
    email: string;
    status: UserStatus;
    win: number;
    lose: number;
    score: number;
    achievements: Achievement[];
    friends: User[];
}
