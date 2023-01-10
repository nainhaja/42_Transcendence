import { PrismaService } from "src/prisma/prisma.service";
import { Server, Socket } from "socket.io";
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    CreateRoom(me: string, roomname: string, type: string, members: string[], password: string, server: Server, client: Socket): Promise<boolean>;
    GetFilteredRooms(user: string, server: Server, client: Socket): Promise<void>;
    GetAllDMs(user: string, server: Server, client: Socket): Promise<void>;
    GetAllRoomMessages(user: string, roomid: string, server: Server, client: Socket): Promise<void>;
}
