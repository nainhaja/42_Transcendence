import { PrismaService } from "src/prisma/prisma.service";
import { Profile, VerifyCallback } from 'passport-42';
import { ConfigService } from "@nestjs/config";
declare const FortyTwoStrategy_base: new (...args: any[]) => any;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(req: Request, accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback): Promise<any>;
}
export {};
