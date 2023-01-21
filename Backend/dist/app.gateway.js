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
exports.AppGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("./prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
;
class user_info {
    constructor() {
        this.id = "";
        this.full_name = "";
        this.username = "";
        this.avatar = "";
        this.avatar_key = "";
        this.is_two_fa_enable = false;
        this.two_fa_code = "";
        this.email = "";
        this.win = 0;
        this.lose = 0;
        this.score = 0;
        this.win_streak = 0;
    }
    User_get_all() {
        return {
            id: this.id,
            full_name: this.full_name,
            username: this.username,
            avatar: this.avatar,
            avatar_key: this.avatar_key,
            is_two_fa_enable: this.is_two_fa_enable,
            two_fa_code: this.two_fa_code,
            email: this.email,
            win: this.win,
            lose: this.lose,
            score: this.score,
            win_streak: this.win_streak,
        };
    }
    user_set_all(new_user) {
        this.id = new_user.id;
        this.full_name = new_user.full_name;
        this.username = new_user.username;
        this.avatar = new_user.avatar;
        this.avatar_key = new_user.avatar_key;
        this.is_two_fa_enable = new_user.is_two_fa_enable;
        this.two_fa_code = new_user.two_fa_code;
        this.email = new_user.email;
        this.win = new_user.win;
        this.lose = new_user.lose;
        this.score = new_user.score;
        this.win_streak = new_user.win_streak;
    }
}
class props {
    constructor(server) {
        this.server = server;
        this.socket_ids = [];
        this.user_id = "";
        this.username = "";
        this.user_status = "";
        this.room = "";
    }
    props_status() {
        return {
            socket_ids: this.socket_ids,
            user_id: this.user_id,
            username: this.username,
            user_status: this.user_status,
        };
    }
    emitting_events() {
        console.log(this.props_status().user_status);
        this.server.to(this.room).emit("game_invite", this.props_status());
    }
}
let AppGateway = class AppGateway {
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger("AppGateway");
        this.my_users = Array();
        this.my_unique_users = Array();
    }
    ;
    async afterInit(server) {
        this.server = server;
        console.log("Habibi weeeecchhh");
        let all_users = await this.prismaService.user.findMany({});
        for (let i = 0; i < all_users.length; i++) {
            await this.prismaService.user.update({
                where: { id: all_users[i].id },
                data: {
                    status: "OFF",
                }
            });
        }
    }
    async handleConnection(client, payload) {
        const user = await this.getUserFromSocket(client);
        console.log("Heeeere yawdi awdi");
        if (user) {
            if (user.status === "OFF") {
                console.log("Wa qwada hadi");
                await this.prismaService.user.update({
                    where: { id: user.id },
                    data: {
                        status: "ON",
                    }
                });
                user.status = "ON";
            }
            if (this.my_users.length === 0) {
                this.my_users.push(new props(this.server));
                this.my_users[0].socket_ids.push(client.id);
                this.my_users[0].user_id = user.id;
                this.my_users[0].username = user.username;
                this.my_users[0].user_status = user.status;
                this.my_users[0].room = user.id;
                console.log("M3lem wslti hna a " + user.username + " Mol had socket " + this.my_users[0].socket_ids[0] + this.my_users[0].user_status);
                this.my_unique_users.push(new user_info());
                this.my_unique_users[0].user_set_all(user);
                client.join(this.my_users[0].room);
            }
            else {
                let i;
                for (i = 0; i < this.my_users.length; i++) {
                    if (user.username === this.my_users[i].username)
                        break;
                }
                if (i === this.my_users.length) {
                    this.my_users.push(new props(this.server));
                    this.my_users[i].room = user.id;
                    this.my_users[i].user_id = user.id;
                    this.my_users[i].username = user.username;
                    this.my_users[i].user_status = user.status;
                    this.my_unique_users.push(new user_info());
                    this.my_unique_users[this.my_unique_users.length - 1].user_set_all(user);
                }
                this.my_users[i].socket_ids.push(client.id);
                console.log("M3lem wslti hna a " + user.username + " Mol had socket " + this.my_users[i].socket_ids[0] + this.my_users[i].user_status);
                client.join(this.my_users[i].room);
            }
        }
    }
    async inviting_game(socket, payload) {
        const user = await this.getUserFromSocket(socket);
        if (user) {
            console.log("i am " + user.username + "i'm trying to invite the player " + payload.player1.username);
            let i;
            let j = 0;
            let x = 0;
            for (i = 0; i < this.my_users.length; i++) {
                if (this.my_users[i].username === payload.player1.username) {
                    x = i;
                }
                else if (this.my_users[i].username === user.username) {
                    j = i;
                }
            }
            if (x !== this.my_users.length) {
                const akhir_user = this.my_unique_users[j].User_get_all();
                console.log("Ana hwa " + akhir_user.username);
                const new_usr = await this.prismaService.user.update({
                    where: { id: akhir_user.id },
                    data: {
                        status: "INQUEUE",
                    }
                });
                console.log("zabi hana " + new_usr.status + " " + this.my_users[x].user_status);
                if (this.my_users[x].user_status === client_1.UserStatus.ON) {
                    console.log("qalwa");
                    this.server.to(this.my_users[x].room).emit("game_invite", this.my_unique_users[j].User_get_all());
                }
                else {
                    console.log("Wa qawaaaada hadiiiiiiii ");
                }
            }
        }
        else
            console.log("Yawdi yawi madkhlti ta hna");
    }
    async handleDisconnect(player_ref) {
    }
    async joinRoom(socket, payload) {
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
};
__decorate([
    (0, websockets_1.SubscribeMessage)("invite_game"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "inviting_game", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user_joined_room'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "joinRoom", null);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(3080, {
        cors: {
            credentials: true,
            origin: 'http://10.12.2.1:3000',
        }
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map