import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { UserDto } from "src/user/dto";
export declare class AuthService {
    private prisma;
    private config;
    private jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    login(req: any, res: any): Promise<void>;
    generate_2fa_secret(user_req: UserDto, res: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    save_secret_db(user: any, secret: string): Promise<void>;
    generate_qr_code(user_obj: any, res: any): Promise<any>;
    enable_2fa(user_req: any, res: any): Promise<void>;
    disable_2fa(user_req: UserDto, res: any): Promise<void>;
    verify_2fa(param: any, res: any): Promise<void>;
    get_user(req_id: string): Promise<import(".prisma/client").User>;
}
