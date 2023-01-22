import { UserService } from './user.service';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    signin(req: any): any;
    change_full_name(req: any, new_full_name: string, res: any): Promise<void>;
    get_user(req: any, res: any): Promise<void>;
    get_me(req: any, res: any): Promise<void>;
    get_user_score(req: any, res: any): Promise<void>;
    logout(req: any, res: any): void;
    edit_user_status(req: any): Promise<void>;
    get_user_achievements(req: any, res: any): Promise<void>;
    get_leaderboard(res: any): Promise<void>;
    get_user_friends(req: any, res: any): Promise<void>;
    add_friend(req: any, param: any, res: any): Promise<void>;
    remove_friend(req: any, param: any, res: any): Promise<void>;
    block_friend(req: any, param: any, res: any): Promise<void>;
    unblock_friend(req: any, param: any, res: any): Promise<void>;
    get_friends(req: any, res: any): Promise<void>;
    status_friend(req: any, param: any, res: any): Promise<void>;
    get_which_one(req: any, param: any, res: any): Promise<void>;
    upload(req: any, file: any): Promise<import("aws-sdk/clients/s3").ManagedUpload.SendData>;
}
