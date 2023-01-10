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
    generate_2fa_secret(user: UserDto, res: any): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    save_secret_db(user: UserDto, secret: string): Promise<void>;
    pipeQrCodeStream(res: any, otpauthUrl: string): Promise<any>;
    enable_2fa(user: UserDto, res: any): Promise<void>;
    disable_2fa(user: UserDto, res: any): Promise<void>;
    verify_2fa(req: any, res: any, param: any): Promise<void>;
    get_user(req_id: string): Promise<import(".prisma/client").User>;
}
