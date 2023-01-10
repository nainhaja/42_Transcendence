import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class RoomsController {
    private readonly jwtService;
    private readonly prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    private chatservice;
}
