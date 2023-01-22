"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async CreateRoom(me, roomname, type, members, password, server, client) {
        let access = null;
        if (type === 'private')
            access = client_1.ACCESS.PRIVATE;
        else if (type === 'public')
            access = client_1.ACCESS.PUBLIC;
        else if (type === 'protected')
            access = client_1.ACCESS.PROTECTED;
        else if (type === 'direct')
            access = client_1.ACCESS.DM;
        else
            return client.emit('roomnotcreated', roomname);
        if (password !== null && password !== undefined) {
            password = password;
        }
        let channel = await this.prisma.room.create({
            data: {
                type: access,
                name: roomname,
                password: password
            }
        });
        client.emit('roomcreated', roomname);
    }
    async GetFilteredRooms(user, server, client) {
    }
    async GetAllDMs(user, server, client) {
    }
    async GetAllRoomMessages(user, roomid, server, client) {
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map