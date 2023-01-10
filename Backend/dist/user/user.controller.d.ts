import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    signin(req: any): any;
    change_username(req: any, new_username: string, res: any): Promise<void>;
    get_user_score(req: any, res: any): Promise<void>;
    logout(req: any, res: any): void;
    edit_user_status(req: any): Promise<void>;
    get_user_achievements(req: any, res: any): Promise<void>;
    get_leaderboard(res: any): Promise<void>;
    get_user_friends(req: any, res: any): Promise<void>;
    add_friend(req: any, param: any, res: any): Promise<void>;
    upload(req: any, file: any): Promise<import("aws-sdk/clients/s3").ManagedUpload.SendData>;
}
