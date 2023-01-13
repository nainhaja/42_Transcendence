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
class Room {
    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.messages = Array();
    }
    pushMessage(newMsg) {
        this.messages.push(newMsg);
    }
    getAllMessages() {
        return ({});
    }
}
class userSocket {
    constructor(userid, socket) {
        this.username = userid;
        this.socket = socket;
        this.room = '';
    }
    setroom(room) {
        this.room = room;
    }
    getroom() {
        return this.room;
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
        this.rooms = Array();
        this.userSocketMap = Array();
        this.roomcount = 0;
    }
    afterInit(server) {
        this.server = server;
        this.logger.log("INITIALIZED");
    }
    async handleConnection(client) {
        const user = await this.getUserFromSocket(client);
        if (user) {
            console.log("client has connected  " + user.username);
            this.userSocketMap.push(new userSocket(user.username, client));
            let notif = new notification();
            var sentpayload = {
                notification: {},
                payload: null,
            };
            notif.setStatusContent('Name Has Been Changed Successfully');
            notif.setStatus(NOTIF_STATUS.SUCCESS);
            sentpayload.notification = notif.getNotification();
            client.emit('connection', sentpayload);
        }
    }
    handleDisconnect(client) {
        console.log("client has disconnected ");
        let index = this.userSocketMap.findIndex(e => e.socket == client);
        this.userSocketMap.splice(index, 1);
    }
    async handleLeave(client, payload) {
        console.log("linet has joined payload  " + payload.room);
        client.leave(payload.room);
        this.server.emit('left', payload.room);
    }
    async create_room(client, payload) {
        let membersObj = JSON.parse(payload['members']);
        if (payload['type'] === 'protected' && payload['password'] === undefined) {
            client.emit('roomnotcreated', 'Password Required');
            return;
        }
        const user = await this.getUserFromSocket(client);
        this.chatservice.CreateRoom(user.username, payload['name'], payload['type'], membersObj, payload['password'], this.server, client);
        console.log(user.username + " has create room  : " + payload.name + ' of type : ' + payload.type);
    }
    async handleJoin(client, payload) {
        console.log("linet has joined room  " + payload.room);
        client.join(payload.room);
        this.server.emit('joined', payload.room);
        let index = this.rooms.findIndex(room => room.name == payload.room);
        this.rooms[index].messages.forEach(msg => {
            this.server.to(payload.room).emit("recieved", msg);
        });
        client.emit('not_joined', payload.room);
        client.emit('joined', payload.room);
        client.emit('not_joined', payload.room);
    }
    async messagerecieved(client, payload) {
        console.log("Message sent By : ", payload.sender);
        console.log(payload.msg + " new message sent in " + payload.room);
        this.server.to(payload.room).emit("recieved", payload);
        let index = this.rooms.findIndex(room => room.name == payload.room);
        let newmsg = {
            sender: payload.sender,
            msg: payload.msg
        };
        this.rooms[index].pushMessage(newmsg);
    }
    async enterroom(client, payload) {
        client.emit('room_not_entered', payload.roomname);
        client.join(payload.roomname);
        client.emit('room_enter', { messages: 'messages' });
    }
    async inviteusertoroom(client, payload) {
        let notif = new notification();
        var sentpayload = {
            notification: {},
            payload: null,
        };
        let updator_role = 'OWNER';
        let room_type = 'PUBLIC';
        if ((updator_role !== 'OWNER' && updator_role !== 'ADMIN') || room_type === 'DM') {
            notif.setStatus(NOTIF_STATUS.FAILED);
            notif.setStatusContent('Permission Denied');
            sentpayload.notification = notif.getNotification();
            client.emit('invited', sentpayload);
            return;
        }
        notif.setStatus(NOTIF_STATUS.UPDATE);
        notif.setStatusContent(payload.invited + ' has been invited ' + payload.access);
        sentpayload.notification = notif.getNotification();
        sentpayload.payload = { invited: payload.invited };
        let roomid = this.getuserSocketRoom(payload.inviter);
        this.server.to[roomid].emit('access_update', sentpayload);
        sentpayload.payload = null;
        notif.setStatus(NOTIF_STATUS.SUCCESS);
        notif.setStatusContent(payload.invited + ' has been added successfully');
        sentpayload.notification = notif.getNotification();
        client.emit('access_update', sentpayload);
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
};
__decorate([
    (0, websockets_1.SubscribeMessage)('leave'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "create_room", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('recieved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "messagerecieved", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('enter_room'),
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