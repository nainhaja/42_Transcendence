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
    RESTRICTION["KICK"] = "KICK";
    RESTRICTION["MUTE"] = "MUTE";
})(RESTRICTION || (RESTRICTION = {}));
var MUTEDURATION;
(function (MUTEDURATION) {
    MUTEDURATION[MUTEDURATION["FIFTEENSEC"] = 30000] = "FIFTEENSEC";
    MUTEDURATION[MUTEDURATION["FIVEMIN"] = 300000] = "FIVEMIN";
    MUTEDURATION[MUTEDURATION["ONEHOUR"] = 3600000] = "ONEHOUR";
})(MUTEDURATION || (MUTEDURATION = {}));
var ACCESS;
(function (ACCESS) {
    ACCESS["PUBLIC"] = "PUBLIC";
    ACCESS["PRIVATE"] = "PRIVATE";
    ACCESS["PROTECTED"] = "PROTECTED";
    ACCESS["DM"] = "DM";
})(ACCESS || (ACCESS = {}));
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
    }
    afterInit(server) {
        this.server = server;
        this.logger.log("INITIALIZED");
    }
    async handleConnection(client) {
        try {
        }
        catch (error) {
        }
    }
    async connect(client) {
        try {
            const user = await this.getUserFromSocket(client);
            let index = this.userSocketMap.findIndex(e => e.username == user.username);
            if (index != -1) {
                this.userSocketMap.splice(index, 1);
            }
            this.userSocketMap.push(new userSocket(user.username, client));
            let sentpayload = {
                payload: {
                    username: user.username,
                    id: user.id,
                    fullname: user.full_name,
                    profile: user.avatar,
                }
            };
            client.emit('connection', sentpayload);
            this.updateAllSocketRooms(client);
            const blocked = await this.getBlockedUsers(user.id);
            console.log(blocked);
            client.emit('getblocked', blocked);
        }
        catch (error) {
        }
    }
    handleDisconnect(client) {
        console.log("client has disconnected ");
        let index = this.userSocketMap.findIndex(e => e.socket == client);
        this.userSocketMap.splice(index, 1);
    }
    async handleLeave(client, payload) {
        try {
            const user = await this.getUserFromSocket(client);
            const room = await this.getRoomByRoomId(payload.roomid);
            client.leave(payload.roomid.toString());
            const deleteroomuser = await this.prismaService.roomUser.delete({
                where: {
                    Room_id_user_id: {
                        Room_id: room.id,
                        user_id: user.id,
                    }
                },
            });
            let msg = user.username + ' has left the room!';
            this.sendMessageToSocketRoom(payload.roomid, 'Server', msg, 'ServerAvatar.png');
            client.emit('requestroomsupdate');
            client.emit('chatclear');
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
            client.emit('requestroomsupdate');
            let msg = user.username + ' has joined the room!';
            this.sendMessageToSocketRoom(payload.id, 'Server', msg, 'ServerAvatar.png');
            this.enterroom(client, roominfo);
        }
        catch (error) {
            client.emit('roomjoinerror', { message: 'try again later!' });
        }
    }
    async messagerecieved(client, payload) {
        try {
            const user = await this.getUserFromSocket(client);
            const roomuser = await this.getRoomUser(payload.roomid, user.id);
            if (roomuser.mute_time.getTime() > Date.now() || roomuser.is_banned)
                return;
            let newmesg = { sender: user.username, messagecontent: payload.message, profile: user.avatar };
            this.server.to(payload.roomid.toString()).emit('messagerecieve', newmesg);
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
        var _a, _b;
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
        if (room.type == ACCESS.DM) {
            const names = room.name.split(' - ');
            const otherusername = (names[0] == user.username) ? names[1] : names[0];
            room.name = otherusername;
            const otheruser = await this.getUserByUserName(otherusername);
            room['profile'] = otheruser.avatar;
        }
        const msgs = await this.getAllMessagesByRoomId(room.id, user.id);
        const sentpayload = {
            room: room,
            messages: msgs,
        };
        room['role'] = roomuser[0].role;
        let index = this.userSocketMap.findIndex(e => e.getusername() == user.username);
        client.leave((_a = this.userSocketMap[index]) === null || _a === void 0 ? void 0 : _a.getroom());
        (_b = this.userSocketMap[index]) === null || _b === void 0 ? void 0 : _b.setroom(room.id.toString());
        client.join(room.id.toString());
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
                return;
            }
            const inviteduser = await this.getUserByUserName(payload.username);
            let addedroomuser;
            if (inviteduser)
                addedroomuser = await this.getRoomUser(payload.roomid, inviteduser.id);
            if (addedroomuser || !inviteduser) {
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
            let msg = updator.username + ' has invited ' + inviteduser.username + ' to the room!';
            this.sendMessageToSocketRoom(updatorroomuser.Room_id, 'Server', msg, 'ServerAvatar.png');
            const othersocket = this.getUserSocket(payload.username);
            othersocket.emit('requestroomsupdate');
        }
        catch (error) {
        }
    }
    async updateroomaccess(client, payload) {
        const user = await this.getUserFromSocket(client);
        const roomuser = await this.prismaService.roomUser.findFirst({
            where: {
                AND: [
                    { Room_id: payload.roomid },
                    { user_id: user.id }
                ]
            },
            include: {
                chat: true,
            }
        });
        let updator_role = roomuser.role;
        let room_type = roomuser.chat.type;
        if (updator_role !== 'OWNER' || room_type === 'DM' || room_type == payload.access) {
            return;
        }
        const update = await this.prismaService.room.update({
            where: {
                id: roomuser.Room_id,
            },
            data: {
                type: payload.access,
                password: payload.password
            }
        });
        let msg = user.username + ' has changed room\'s Access type  to ' + room_type + '!';
        this.sendMessageToSocketRoom(roomuser.Room_id, 'Server', msg, 'ServerAvatar.png');
        this.server.emit('requestroomsupdate', null);
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
        try {
            const user = await this.getUserFromSocket(client);
            const updateduser = await this.prismaService.user.findFirst({
                where: {
                    username: payload.username
                }
            });
            const updatorroomuser = await this.prismaService.roomUser.findFirst({
                where: {
                    AND: [
                        { Room_id: payload.roomid },
                        { user_id: user.id }
                    ]
                }
            });
            const updatedroomuser = await this.prismaService.roomUser.findFirst({
                where: {
                    AND: [
                        { Room_id: payload.roomid },
                        { user_id: updateduser.id }
                    ]
                }
            });
            let updated_role = updatedroomuser.role;
            let updator_role = updatorroomuser.role;
            if (updator_role !== client_1.Role.OWNER || payload.role === client_1.Role.OWNER || updated_role == client_1.Role.OWNER) {
                return;
            }
            const update = await this.prismaService.roomUser.update({
                where: {
                    Room_id_user_id: {
                        Room_id: updatedroomuser.Room_id,
                        user_id: updatedroomuser.user_id,
                    }
                },
                data: {
                    role: payload.role,
                }
            });
            let msg = updateduser.username + ' is Now ' + update.role + ' !';
            this.sendMessageToSocketRoom(updatorroomuser.Room_id, 'Server', msg, 'ServerAvatar.png');
            return;
        }
        catch (error) {
        }
    }
    async updaterestriction(client, payload) {
        var _a, _b, _c;
        const user = await this.getUserFromSocket(client);
        const roomuser = await this.getRoomUser(payload.roomid, user.id);
        const restricteduser = await this.getUserByUserName(payload.username);
        const restrictedroomuser = await this.getRoomUser(payload.roomid, restricteduser.id);
        let restricted_role = restrictedroomuser.role;
        let restrictor_role = roomuser.role;
        if (restrictor_role === client_1.Role.MEMBER || restricted_role === client_1.Role.OWNER
            || (restricted_role === client_1.Role.ADMIN && restrictor_role === client_1.Role.ADMIN)) {
            return;
        }
        let msg = payload.username + ' has been ';
        if (payload.restriction === RESTRICTION.BAN) {
            const update = await this.prismaService.roomUser.update({
                where: {
                    Room_id_user_id: {
                        Room_id: payload.roomid,
                        user_id: restricteduser.id
                    }
                },
                data: {
                    is_banned: true,
                }
            });
            msg += 'BANNED';
        }
        else if (payload.restriction === RESTRICTION.MUTE) {
            let newDate = new Date(Date.now() + payload.duration);
            const update = await this.prismaService.roomUser.update({
                where: {
                    Room_id_user_id: {
                        Room_id: payload.roomid,
                        user_id: restricteduser.id,
                    }
                },
                data: {
                    mute_time: newDate
                }
            });
            msg += 'MUTED';
        }
        else if (payload.restriction === RESTRICTION.KICK) {
            const update = await this.prismaService.roomUser.delete({
                where: {
                    Room_id_user_id: {
                        Room_id: payload.roomid,
                        user_id: restricteduser.id
                    }
                },
            });
            msg += 'KICKED';
        }
        this.sendMessageToSocketRoom(payload.roomid, 'Server', msg, 'ServerAvatar.png');
        if (payload.restriction == RESTRICTION.KICK || payload.restriction == RESTRICTION.BAN) {
            let index = this.userSocketMap.findIndex(e => e.getusername() == restricteduser.username);
            (_a = this.userSocketMap[index]) === null || _a === void 0 ? void 0 : _a.getsocket().leave(roomuser.Room_id.toString());
            (_b = this.userSocketMap[index]) === null || _b === void 0 ? void 0 : _b.getsocket().emit('chatclear');
            (_c = this.userSocketMap[index]) === null || _c === void 0 ? void 0 : _c.getsocket().emit('requestroomsupdate');
        }
        return;
    }
    async updateAllSocketRooms(client) {
        try {
            const user = await this.getUserFromSocket(client);
            let notif = new notification();
            var sentpayload = {
                notification: {},
                payload: null,
            };
            const roomusers = await this.getAllRoomUsersByUserId(user.id);
            let bannedroomusers = roomusers.filter((roomuser) => { roomuser.is_banned; });
            let bannedrooms = bannedroomusers.map((room) => { return room.chat; });
            let joinedrooms = roomusers.map((room) => {
                room.chat['joined'] = true;
                room.chat['lastmessage'] = '';
                if (room.is_banned)
                    room.chat['banned'] = true;
                else
                    room.chat['banned'] = false;
                return (room.chat);
            });
            joinedrooms = joinedrooms.filter((room) => { return (room.type != ACCESS.DM); });
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
            let rooms = await this.getAllDMs(client);
            joinedrooms.forEach((room) => rooms.push(room));
            sentpayload.payload = {
                rooms: rooms,
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
    async getAllDMs(client) {
        const user = await this.getUserFromSocket(client);
        const dms = await this.prismaService.roomUser.findMany({
            where: {
                AND: [
                    { user_id: user.id },
                    {
                        chat: {
                            type: ACCESS.DM
                        }
                    }
                ]
            },
            include: { chat: true, }
        });
        let filterd = [];
        dms.forEach((room) => {
            filterd.push(room.chat);
        });
        for (let i = 0; i < filterd.length; i++) {
            const names = filterd[i].name.split(' - ');
            const otherusername = user.username == names[0] ? names[1] : names[0];
            filterd[i].name = otherusername;
            filterd[i]['joined'] = true;
            filterd[i]['lastmessage'] = '';
            const otheruser = await this.getUserByUserName(otherusername);
            filterd[i]['profile'] = otheruser.avatar;
        }
        return filterd;
    }
    async getAllRooms(socket) {
        const allrooms = await this.prismaService.room.findMany({
            where: {
                OR: [
                    { type: ACCESS.PROTECTED },
                    { type: ACCESS.PUBLIC }
                ]
            },
        });
        return (allrooms);
    }
    async getAllRoomUsersByUserId(user_id) {
        const roomusers = await this.prismaService.roomUser.findMany({
            where: {
                AND: [
                    { user_id: user_id },
                    { is_banned: false },
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
    sendMessageToSocketRoom(roomid, sender, msg, profile) {
        let newmesg = { sender: sender, messagecontent: msg, profile: profile };
        this.server.to(roomid.toString()).emit('messagerecieve', newmesg);
    }
    async getBlockedUsers(userid) {
        const blocked = await this.prismaService.user.findUnique({
            where: {
                id: userid
            },
            select: {
                blocked: true,
                blockedRelation: true,
            }
        });
        let blockedusernames = [];
        for (let i = 0; i < blocked.blocked.length; i++) {
            blockedusernames.push(blocked.blocked[i].username);
        }
        for (let i = 0; i < blocked.blockedRelation.length; i++) {
            blockedusernames.push(blocked.blockedRelation[i].username);
        }
        return (blockedusernames);
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('connectpls'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "connect", null);
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
    (0, websockets_1.SubscribeMessage)('updateaccess'),
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
    (0, websockets_1.SubscribeMessage)('updaterole'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "updateuserrole", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updaterestriction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
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
        },
        namespace: 'chat'
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map