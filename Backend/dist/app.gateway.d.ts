import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from "socket.io";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    private logger;
    private my_users;
    private server;
    private my_unique_users;
    afterInit(server: Server): Promise<void>;
    handleConnection(client: Socket, payload: any): Promise<void>;
    inviting_game(socket: Socket, payload: any): Promise<void>;
    handleDisconnect(player_ref: Socket): Promise<void>;
    get_this_user(user_id: string): Promise<User>;
    match_history_all(socket: Socket, payload: any): Promise<void>;
    getUserFromSocket(socket: Socket): Promise<User>;
}
