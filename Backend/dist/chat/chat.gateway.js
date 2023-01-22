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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
var NOTIF_STATUS;
(function (NOTIF_STATUS) {
    NOTIF_STATUS["FAILED"] = "Failed";
    NOTIF_STATUS["SUCCESS"] = "Success";
    NOTIF_STATUS["UPDATE"] = "Update";
    NOTIF_STATUS["RESTRICTED"] = "Restricted";
})(NOTIF_STATUS || (NOTIF_STATUS = {}));
var RESTRICTION;
(function (RESTRICTION) {
    RESTRICTION["BAN"] = "BAN";
    RESTRICTION["MUTE"] = "MUTE";
    RESTRICTION["KICK"] = "KICK";
})(RESTRICTION || (RESTRICTION = {}));
var ACCESS;
(function (ACCESS) {
    ACCESS["PUBLIC"] = "PUBLIC";
    ACCESS["PRIVATE"] = "PRIVATE";
    ACCESS["PROTECTED"] = "PROTECTED";
    ACCESS["DM"] = "DM";
})(ACCESS || (ACCESS = {}));
var MUTEDURATION;
(function (MUTEDURATION) {
    MUTEDURATION["HALFMIN"] = "15 SEC";
    MUTEDURATION["MIN"] = "1 MIN";
    MUTEDURATION["HALFHOUR"] = "30 MIN";
    MUTEDURATION["HOUR"] = "1 HOUR";
})(MUTEDURATION || (MUTEDURATION = {}));
var ROLE;
(function (ROLE) {
    ROLE["OWNER"] = "OWNER";
    ROLE["ADMIN"] = "ADMIN";
    ROLE["MEMBER"] = "MEMBER";
})(ROLE || (ROLE = {}));
class userSocket {
    constructor(userid, socket) {
        this.username = userid;
        this.socket = socket;
        this.currentroom = '';
    }
    setroom(room) {
        this.currentroom = room;
    }
    getroom() {
        return this.currentroom;
    }
    getsocket() {
        return this.socket;
    }
    getusername() {
        return this.username;
    }
}
class notification {
    constructor() {
        this.status = '';
        this.statuscontent = '';
    }
    setStatus(status) {
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    setStatusContent(statuscontent) {
        this.statuscontent = statuscontent;
    }
    getStatusContent() {
        return this.statuscontent;
    }
    getNotification() {
        let data = {
            status: this.status,
            statuscontent: this.statuscontent,
        };
        return data;
    }
}
let ChatGateway = class ChatGateway {
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger("ChatGateway");
        this.userSocketMap = Array();
        this.roomcount = 0;
    }
    afterInit(server) {
        this.server = server;
        this.logger.log("INITIALIZED");
    }
    async handleConnection(client) {
        try {
            const user = await this.getUserFromSocket(client);
            console.log(user.username + " has just connected!");
            this.userSocketMap.push(new userSocket(user.username, client));
            let notif = new notification();
            var sentpayload = {
                notification: {},
                payload: null,
            };
            const roomusers = await this.getAllRoomsByUserId(user.id);
            let joinedrooms = roomusers.map((room) => {
                room.chat['joined'] = true;
                room.chat['lastmessage'] = '';
                return (room.chat);
            });
            let allrooms = await this.getAllRooms(client);
            for (let i = 0; i < allrooms.length; i++) {
                let found = false;
                for (let j = 0; j < joinedrooms.length; j++) {
                    if (allrooms[i].id == joinedrooms[j].id) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    joinedrooms.push(allrooms[i]);
            }
            sentpayload.payload = {
                rooms: joinedrooms,
                otherrooms: [],
                dms: [],
                username: user.username,
                id: user.id,
                fullname: user.full_name,
                profile: user.avatar,
            };
            await client.emit('connection', sentpayload);
        }
        catch (_a) {
            console.log('couldnt connect');
        }
    }
    handleDisconnect(client) {
        console.log("client has disconnected ");
        let index = this.userSocketMap.findIndex(e => e.socket == client);
        this.userSocketMap.splice(index, 1);
    }
    async handleLeave(client, payload) {
        try {
        }
        catch (error) {
        }
    }
    async create_room(client, payload) {
        try {
            const user = await this.getUserFromSocket(client);
            const room = await this.prismaService.room.create({
                data: {
                    name: payload.name,
                    type: payload.access,
                    password: payload.password,
                }
            });
            const roomuser = await this.prismaService.roomUser.create({
                data: {
                    user_id: user.id,
                    Room_id: room.id,
                    role: client_1.Role.OWNER,
                    is_banned: false,
                    mute_time: new Date(),
                }
            });
            room['joined'] = true;
            let sentpayload = {
                payload: {
                    room: room,
                }
            };
            console.log(payload.name + ' with id: ' + room.id + ' has been created succefully ');
            client.emit('roomcreate', sentpayload);
            this.server.emit('requestroomsupdate');
            const roominfo = {
                roomname: room.name,
                lastmessage: 'hello',
                lastmessagedate: '',
                id: room.id,
                type: room.type,
                joined: true,
                password: '',
            };
            this.enterroom(client, roominfo);
        }
        catch (_a) {
            console.log('room cant be created');
        }
    }
    async handleJoin(client, payload) {
        try {
            const room = await this.getRoomByRoomId(payload.id);
            const user = await this.getUserFromSocket(client);
            if (room.type == ACCESS.PROTECTED && room.password != payload.password) {
                console.log('Wrong Password!!??');
                client.emit('roomjoinerror', { message: 'wrong password!' });
                return;
            }
            const roomuser = await this.prismaService.roomUser.create({
                data: {
                    user_id: user.id,
                    Room_id: room.id,
                    role: client_1.Role.MEMBER,
                    is_banned: false,
                    mute_time: new Date(),
                }
            });
            client.emit('roomjoin', roomuser);
            const roominfo = {
                roomname: room.name,
                lastmessage: '',
                lastmessagedate: '',
                id: room.id,
                type: room.type,
                joined: true,
                password: '',
            };
            this.enterroom(client, roominfo);
            client.emit('requestroomsupdate');
        }
        catch (error) {
            client.emit('roomjoinerror', { message: 'try again later!' });
        }
    }
    async messagerecieved(client, payload) {
        try {
            const user = await this.getUserFromSocket(client);
            console.log(user.username + " : ", payload.message);
            let newmesg = { sender: user.username, messagecontent: payload.message, profile: user.avatar };
            this.userSocketMap.forEach((usersocket) => {
                if (usersocket.currentroom == payload.roomid)
                    usersocket.getsocket().emit('messagerecieve', newmesg);
            });
            let room = await this.getRoomByRoomId(payload.roomid);
            const msguser = await this.prismaService.messageUser.create({
                data: {
                    room_id: room.id,
                    user_id: user.id,
                    content: payload.message,
                    avatar: user.avatar,
                    username: user.username,
                }
            });
        }
        catch (error) {
        }
    }
    async enterroom(client, payload) {
        const room = await this.getRoomByRoomId(payload.id);
        const user = await this.getUserFromSocket(client);
        const roomuser = await this.prismaService.roomUser.findMany({
            where: {
                AND: [
                    {
                        user_id: user.id
                    },
                    {
                        Room_id: room.id
                    },
                ],
            },
        });
        if (roomuser[0].is_banned) {
            return;
        }
        const msgs = await this.getAllMessagesByRoomId(room.id, user.id);
        const sentpayload = {
            room: room,
            messages: msgs,
        };
        room['role'] = roomuser[0].role;
        let index = this.userSocketMap.findIndex(e => e.socket == client);
        client.leave[this.userSocketMap[index].getroom()];
        this.userSocketMap[index].setroom(room.id.toString());
        client.join[this.userSocketMap[index].getroom()];
        client.emit('roomenter', sentpayload);
    }
    async inviteusertoroom(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        try {
            const updator = await this.getUserFromSocket(client);
            const updatorroomuser = await this.getRoomUser(payload.roomid, updator.id);
            if ((updatorroomuser.role != ROLE.OWNER && updatorroomuser.role != ROLE.ADMIN) || updatorroomuser.chat.type == ACCESS.DM) {
                notif.setStatus(NOTIF_STATUS.FAILED);
                notif.setStatusContent('Permission Denied');
                sentpayload.notification = notif.getNotification();
                client.emit('invited', sentpayload);
                return;
            }
            const inviteduser = await this.getUserByUserName(payload.username);
            let addedroomuser;
            if (inviteduser)
                addedroomuser = await this.getRoomUser(payload.roomid, inviteduser.id);
            if (addedroomuser || !inviteduser) {
                console.log('already in room or user doesn\'t exist!');
                return;
            }
            else
                console.log('will be in room soon!');
            addedroomuser = await this.prismaService.roomUser.create({
                data: {
                    user_id: inviteduser.id,
                    Room_id: payload.roomid,
                    role: client_1.Role.MEMBER,
                    is_banned: false,
                    mute_time: new Date(),
                }
            });
            const othersocket = this.getUserSocket(payload.username);
            othersocket.emit('requestroomsupdate');
        }
        catch (error) {
        }
    }
    async updateroomaccess(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        let updator_role = 'OWNER';
        let room_type = 'PUBLIC';
        if (updator_role !== 'OWNER' || room_type === 'DM') {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Permission Denied');
            sentpayload.notification = notif.getNotification();
            client.emit('access_update', sentpayload);
            return;
        }
        if (payload.access === 'protected' && payload.password == undefined) {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Valid Password Required');
            sentpayload.notification = notif.getNotification();
            client.emit('access_update', sentpayload);
            return;
        }
        sentpayload.payload = { room: payload.room, newaccess: payload.access };
        notif.setStatus(NOTIF_STATUS.UPDATE);
        notif.setStatusContent(payload.room + ' is now ' + payload.access);
        sentpayload.notification = notif.getNotification();
        let roomid = this.getuserSocketRoom(payload.updater);
        this.server.to[roomid].emit('access_update', sentpayload);
        sentpayload.payload = null;
        notif.setStatus(NOTIF_STATUS.SUCCESS);
        notif.setStatusContent(payload.room + ' is now ' + payload.access);
        sentpayload.notification = notif.getNotification();
        client.emit('access_update', sentpayload);
    }
    async updateroomname(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        let updator_role = 'OWNER';
        let room_type = 'PUBLIC';
        if (updator_role === 'member' || room_type === 'DM') {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Permission Denied');
            sentpayload.notification = notif.getNotification();
            client.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
            return;
        }
        else if (payload.newname === '    ') {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Invalid Name');
            sentpayload.notification = notif.getNotification();
            client.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
            return;
        }
        this.server.emit('name_update', { oldname: payload.oldname, newname: payload.newname });
        sentpayload.payload = { updator: payload.updator, newname: payload.newname, oldname: payload.oldname };
        notif.setStatusContent('Name Has Been Changed Successfully');
        notif.setStatus(NOTIF_STATUS.SUCCESS);
        sentpayload.notification = notif.getNotification();
        client.emit('name_update', sentpayload);
    }
    async updateuserrole(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        let updated_role = 'member';
        let updator_role = 'owner';
        if (updator_role !== 'owner' || payload.newrole === 'owner') {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Permission Denied');
            sentpayload.notification = notif.getNotification();
            client.emit('role_update', sentpayload);
            return;
        }
        if (sentpayload.payload == null) {
            notif.setStatusContent('Try Again Later');
            notif.setStatus(NOTIF_STATUS.FAILED);
            sentpayload.notification = notif.getNotification();
            client.emit('role_update', 'Role Updated');
        }
        else {
            notif.setStatus(NOTIF_STATUS.UPDATE);
            notif.setStatusContent(updated_role + ' role Has Been Updated');
            sentpayload.notification = notif.getNotification();
            let roomid = this.getuserSocketRoom(payload.updator);
            this.server.to[roomid].emit('role_update', { room: payload.room, updateduser: updated_role, newrole: payload.newrole });
        }
    }
    updaterestriction(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        let restricted_role = 'member';
        let restrictor_role = 'owner';
        if (restrictor_role === 'member' || restricted_role === 'owner'
            || (restricted_role === 'admin' && restrictor_role === 'admin')) {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Permission Denied');
            sentpayload.notification = notif.getNotification();
            client.emit('restriction_update', sentpayload);
            return;
        }
        if (payload.restriction === RESTRICTION.BAN) {
            sentpayload.payload.message = payload.updateduser + ' Has Been Banned';
            notif.setStatusContent(payload.updateduser + ' Has Been Banned');
        }
        else if (payload.restriction === RESTRICTION.MUTE) {
            sentpayload.payload.message = payload.updateduser + ' Has Been Muted For ' + payload.muteduration;
            notif.setStatusContent(payload.updateduser + ' Has Been Muted For ' + payload.muteduration);
        }
        else if (payload.restriction === RESTRICTION.KICK) {
            sentpayload.payload.message = payload.updateduser + ' Has Been Kicked';
            notif.setStatusContent(payload.updateduser + ' Has Been Kicked');
        }
        else {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Invalid Restriction');
            sentpayload.notification = notif.getNotification();
            client.emit('restriction_update', sentpayload);
            return;
        }
        if (sentpayload.payload == null) {
            notif.setStatusContent('Try Again Later');
            notif.setStatus(NOTIF_STATUS.FAILED);
            sentpayload.notification = notif.getNotification();
            client.emit('restriction_updated', sentpayload);
        }
        else {
            notif.setStatus(NOTIF_STATUS.UPDATE);
            let roomid = this.getuserSocketRoom(payload.restrictor.username);
            sentpayload.notification = notif.getNotification();
            this.server.to[roomid].emit('restriction_updated', sentpayload);
            sentpayload.payload = null;
            notif.setStatusContent('You Have Banned ' + payload.updateduser + 'Successfully');
            notif.setStatus(NOTIF_STATUS.SUCCESS);
            sentpayload.notification = notif.getNotification();
            client.emit('restriction_updated', sentpayload);
            var restrictedSocket = this.getUserSocket(payload.updateduser);
            notif.setStatusContent('You Have Been Banned');
            notif.setStatus(NOTIF_STATUS.RESTRICTED);
            sentpayload.notification = notif.getNotification();
            restrictedSocket.emit('restriction_updated', sentpayload);
        }
    }
    async updateAllSocketRooms(client) {
        try {
            const user = await this.getUserFromSocket(client);
            let notif = new notification();
            var sentpayload = {
                notification: {},
                payload: null,
            };
            const roomusers = await this.getAllRoomsByUserId(user.id);
            let joinedrooms = roomusers.map((room) => {
                room.chat['joined'] = true;
                room.chat['lastmessage'] = '';
                return (room.chat);
            });
            let allrooms = await this.getAllRooms(client);
            for (let i = 0; i < allrooms.length; i++) {
                let found = false;
                for (let j = 0; j < joinedrooms.length; j++) {
                    if (allrooms[i].id == joinedrooms[j].id) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    joinedrooms.push(allrooms[i]);
            }
            sentpayload.payload = {
                rooms: joinedrooms,
                otherrooms: [],
                dms: [],
            };
            client.emit('roomsupdate', sentpayload);
        }
        catch (_a) {
            console.log('couldnt connect');
        }
    }
    async getUserFromSocket(socket) {
        const cookies = socket.handshake.headers.cookie;
        if (cookies) {
            const token = cookies.split(';').find((c) => c.trim().startsWith('access_token='));
            if (token) {
                const payload = this.jwtService.decode(token.split('=')[1]);
                const user = await this.prismaService.user.findUnique({
                    where: { id: payload.id },
                });
                return user;
            }
        }
        return null;
    }
    getuserSocketRoom(username) {
        let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
        return this.userSocketMap[index].getroom();
    }
    getUserSocket(username) {
        let index = this.userSocketMap.findIndex(usersocket => usersocket.getusername() == username);
        return this.userSocketMap[index].getsocket();
    }
    async getAllRooms(socket) {
        const allrooms = await this.prismaService.room.findMany({
            where: {
                NOT: {
                    type: ACCESS.PRIVATE
                }
            },
        });
        return (allrooms);
    }
    async getAllRoomsByUserId(user_id) {
        const roomusers = await this.prismaService.roomUser.findMany({
            where: {
                AND: [
                    {
                        user_id: user_id
                    },
                    {
                        is_banned: false
                    },
                ],
            },
            include: {
                chat: {}
            }
        });
        return (roomusers);
    }
    async getAllMessagesByRoomId(room_id, user_id) {
        const allMessages = await this.prismaService.messageUser.findMany({
            where: {
                room_id: room_id
            },
        });
        let messages = allMessages.map((msg) => {
            return {
                id: msg.Message_id,
                sender: msg.username,
                messagecontent: msg.content,
                time: msg.time,
                profile: msg.avatar
            };
        });
        return messages;
    }
    async getLastMessagesByRoomId(room_id) {
        const lastmessage = await this.prismaService.messageUser.findMany({
            where: {
                room_id: room_id,
            },
            orderBy: {
                time: 'desc'
            },
            take: 1
        });
        return (lastmessage);
    }
    async getUserByUserName(username) {
        const user = await this.prismaService.user.findFirst({
            where: {
                username: username
            }
        });
        return user;
    }
    async getRoomUser(roomid, userid) {
        const roomuser = await this.prismaService.roomUser.findFirst({
            where: {
                AND: [{
                        Room_id: roomid
                    }, {
                        user_id: userid
                    }]
            },
            include: {
                chat: true
            }
        });
        return roomuser;
    }
    async getRoomByRoomId(room_id) {
        const room = await this.prismaService.room.findUnique({
            where: {
                id: room_id
            }
        });
        return room;
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('leave'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createroom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "create_room", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinroom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('recievemessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "messagerecieved", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enterroom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "enterroom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "inviteusertoroom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_access'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateroomaccess", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_name'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateroomname", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_role'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateuserrole", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update_restriction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "updaterestriction", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updaterooms'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateAllSocketRooms", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(4000, {
        cors: {
            credentials: true,
            origin: 'http://localhost:3000',
        }
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map