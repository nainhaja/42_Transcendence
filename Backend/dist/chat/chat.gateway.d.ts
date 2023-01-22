import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from "socket.io";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly prismaService;
    constructor(jwtService: JwtService, prismaService: PrismaService);
    private server;
    private logger;
    private chatservice;
    private userSocketMap;
    roomcount: number;
    afterInit(server: Server): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleLeave(client: Socket, payload: any): Promise<void>;
    create_room(client: Socket, payload: any): Promise<void>;
    handleJoin(client: Socket, payload: any): Promise<void>;
    messagerecieved(client: Socket, payload: any): Promise<void>;
    enterroom(client: Socket, payload: any): Promise<void>;
    inviteusertoroom(client: Socket, payload: any): Promise<void>;
    updateroomaccess(client: Socket, payload: any): Promise<void>;
    updateroomname(client: any, payload: any): Promise<void>;
    updateuserrole(client: any, payload: any): Promise<void>;
    updaterestriction(client: Socket, payload: any): void;
    updateAllSocketRooms(client: Socket): Promise<void>;
    getUserFromSocket(socket: Socket): Promise<import(".prisma/client").User>;
    getuserSocketRoom(username: string): string;
    getUserSocket(username: string): Socket;
    getAllRooms(socket: Socket): Promise<import(".prisma/client").Room[]>;
    getAllRoomsByUserId(user_id: string): Promise<(import(".prisma/client").RoomUser & {
        chat: import(".prisma/client").Room;
    })[]>;
    getAllMessagesByRoomId(room_id: any, user_id: string): Promise<{
        id: number;
        sender: string;
        messagecontent: string;
        time: Date;
        profile: string;
    }[]>;
    getLastMessagesByRoomId(room_id: any): Promise<import(".prisma/client").MessageUser[]>;
    getUserByUserName(username: string): Promise<import(".prisma/client").User>;
    getRoomUser(roomid: number, userid: string): Promise<import(".prisma/client").RoomUser & {
        chat: import(".prisma/client").Room;
    }>;
    getRoomByRoomId(room_id: number): Promise<import(".prisma/client").Room>;
}
