import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket, Server } from "socket.io";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Achievement, UserStatus } from '@prisma/client';
interface player_properties {
    input: string;
    id: string;
    mode: number;
}
export declare class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    private server;
    private logger;
    private GameMode;
    private queues;
    private live_games;
    private cpt;
    private socket_with_queue_id;
    private user_with_queue_id;
    private user_with_queue_mode;
    private user_with_game_id;
    afterInit(server: Server): void;
    handleConnection(client: Socket, payload: any): Promise<void>;
    handleDisconnect(player_ref: Socket): Promise<void>;
    update_user_achievements(user: any, achievement: Achievement): Promise<any>;
    user_achievements(user_id: string): Promise<void>;
    Game_stopped(player_ref: Socket): Promise<void>;
    spectJoinRoom(socket: Socket): void;
    spectJoin(socket: Socket, payload: any): void;
    get_user(req_id: string): Promise<import(".prisma/client").User>;
    update_user_score(user: any, score: number): Promise<import(".prisma/client").User>;
    get_user_score(user_id: string): Promise<number>;
    GameEnded(socket: Socket, payload: any): Promise<void>;
    edit_user_status(user_id: string, status: UserStatus): Promise<void>;
    get_match_history(socket: Socket): Promise<void>;
    get_user_status(user_id: string): Promise<UserStatus>;
    invite_qu(socket: Socket, payload: any): Promise<void>;
    joinRoom(socket: Socket, payload: any): Promise<void>;
    handlePlayerInput(player_ref: Socket, payload: player_properties): Promise<void>;
    getUserFromSocket(socket: Socket): Promise<import(".prisma/client").User>;
}
export {};
