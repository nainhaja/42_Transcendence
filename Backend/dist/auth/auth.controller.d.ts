import { AuthService } from "./auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
export declare class AuthController {
    private prisma;
    private config;
    private authService;
    constructor(prisma: PrismaService, config: ConfigService, authService: AuthService);
    login(req: any, res: any): Promise<void>;
    generate_qr_code(req: any, res: any): Promise<any>;
    disable_2fa(req: any, res: any): Promise<void>;
    verify_2fa(req: any, res: any, param: any): Promise<void>;
}
