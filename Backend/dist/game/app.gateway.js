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
const prisma_service_1 = require("../prisma/prisma.service");
const user_service_1 = require("../user/user.service");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
class mode_du_game {
    constructor() {
        this.queues = new Array();
    }
}
class for_spect {
    constructor() {
        this.user_1_name = "";
        this.user_2_name = "";
        this.user_1_score = 0;
        this.user_2_score = 0;
        this.user_1_avatar = "";
        this.user_2_avatar = "";
        this.index = -1;
    }
}
class Game {
    constructor(server) {
        this.server = server;
        this.width = 800;
        this.height = 400;
        this.aspectRatio = 2;
        this.ball_radius = 10;
        this.ball_speed = 0;
        this.game_mode = 0;
        this.paddle_width = 10;
        this.paddle_height = 100;
        this.paddleSpeed = 10;
        this.ball_x = this.width / 2;
        this.ball_y = this.height / 2;
        this.ball_direction_x = 1;
        this.ball_direction_y = 1;
        this.fr_paddle_x = 0;
        this.fr_paddle_y = 0;
        this.sec_paddle_x = this.width - this.paddle_width;
        this.sec_paddle_y = 0;
        this.state = "waiting";
        this.players = [];
        this.users = [];
        this.users_names = [];
        this.players_avatar = [];
        this.players_names = [];
        this.room = "";
        this.scores = [0, 0];
        this.score_limit = 1;
        this.winner = "";
        this.winner_name = "";
        this.lastscored = "";
        this.numgames = 0;
        this.user_with_game_id = new Map();
        this.user_Service = new user_service_1.UserService(this.prisma, new config_1.ConfigService);
    }
    player_ids() {
        return this.players;
    }
    emit_and_clear() {
        this.server.to(this.room).emit("queue_status", this.queue_status());
        clearInterval(this.game_initializer);
    }
    check_players_are_ready() {
        if (this.players.length === 2) {
            this.update_status("matched");
            this.server.to(this.room).emit("queue_status", this.queue_status());
            this.starting_queue();
        }
    }
    update_winner(player_id, user_name) {
        this.winner = player_id;
        this.winner_name = user_name;
    }
    push_player(player, avatar, name) {
        if (this.players.length < 2) {
            if (this.players_names[0] !== name) {
                this.players.push(player);
                this.players_avatar.push(avatar);
                this.players_names.push(name);
            }
        }
    }
    push_players(player, avatar, name) {
        if (this.players.length < 2) {
            if (this.players_names[0] !== name) {
                this.players.push(player);
            }
        }
    }
    push_users(player, user_name) {
        if (this.users.length < 2) {
            this.users.push(player);
            this.users_names.push(user_name);
        }
    }
    remove_player() {
        this.players.pop();
        this.players_avatar.pop();
        this.players_names.pop();
    }
    addSpec(spec) {
        this.spects.push(spec);
    }
    update_room(name) {
        this.room = name;
    }
    update_status(state) {
        this.state = state;
    }
    ball_properties() {
        this.ball_x += this.ball_speed * this.ball_direction_x;
        this.ball_y += this.ball_speed * this.ball_direction_y;
    }
    starting_queue() {
        this.game_initializer = setInterval(this.My_loop_function, 1000 / 60, this);
    }
    My_loop_function(game) {
        game.ball_properties();
        game.ball_collision_with_screen();
        game.ball_collision_with_paddles();
        game.updateScore(game);
        game.server.to(game.room).emit("queue_status", game.queue_status());
    }
    initGame(id) {
        if (id === this.players[0]) {
            this.ball_x = this.width / 10;
            this.ball_y = this.height / 5;
            this.ball_direction_x *= -1;
        }
        else if (id === this.players[1]) {
            this.ball_x = this.width * (9 / 10);
            this.ball_y = this.height / 5;
            this.ball_direction_x *= -1;
        }
        this.starting_queue();
        this.update_status("play");
    }
    async updateScore(game) {
        if (this.ball_x > this.sec_paddle_x) {
            this.scores[0]++;
            this.update_status("scored");
            this.lastscored = this.players[0];
            this.ball_direction_x *= -1;
            clearInterval(this.game_initializer);
        }
        else if (this.ball_x < this.fr_paddle_x + this.paddle_width) {
            this.scores[1]++;
            this.update_status("scored");
            this.lastscored = this.players[1];
            this.ball_direction_x *= -1;
            clearInterval(this.game_initializer);
        }
        if (this.scores[0] === this.score_limit) {
            this.winner = this.users[0];
            this.winner_name = this.users_names[0];
            this.update_status("endGame");
            clearInterval(this.game_initializer);
            this.server.to(this.room).emit("It_ended");
        }
        else if (this.scores[1] === this.score_limit) {
            this.winner = this.users[1];
            this.winner_name = this.users_names[1];
            this.update_status("endGame");
            clearInterval(this.game_initializer);
            this.server.to(this.room).emit("It_ended");
        }
    }
    ball_collision_with_screen() {
        if (this.ball_x + (this.ball_radius / 2) >= this.width)
            this.ball_direction_x *= -1;
        else if (this.ball_x - (this.ball_radius / 2) <= 0)
            this.ball_direction_x *= -1;
        if (this.ball_y + (this.ball_radius / 2) >= this.height)
            this.ball_direction_y *= -1;
        else if (this.ball_y - (this.ball_radius / 2) <= 0)
            this.ball_direction_y *= -1;
    }
    ball_collision_with_paddles() {
        if (this.ball_direction_x === -1) {
            if (this.ball_y > this.fr_paddle_y && this.ball_y < this.fr_paddle_y + this.paddle_height) {
                if ((this.ball_x - (this.ball_radius / 2) - this.paddle_width) <= 0)
                    this.ball_direction_x *= -1;
            }
        }
        if (this.ball_direction_x === 1) {
            if (this.ball_y > this.sec_paddle_y && this.ball_y < this.sec_paddle_y + this.paddle_height) {
                if ((this.ball_x + (this.ball_radius / 2) + this.paddle_width) >= this.width)
                    this.ball_direction_x *= -1;
            }
        }
    }
    update_paddles(payload) {
        if (payload.input === "DOWN") {
            if (payload.id === this.users[0]) {
                if (this.fr_paddle_y + this.paddleSpeed < this.height - this.paddle_height)
                    this.fr_paddle_y += this.paddleSpeed;
                else
                    this.fr_paddle_y = this.height - this.paddle_height;
            }
            else {
                if (this.sec_paddle_y + this.paddleSpeed < this.height - this.paddle_height)
                    this.sec_paddle_y += this.paddleSpeed;
                else
                    this.sec_paddle_y = this.height - this.paddle_height;
            }
        }
        else {
            if (payload.id === this.users[0]) {
                if (this.fr_paddle_y - this.paddleSpeed > 0)
                    this.fr_paddle_y -= this.paddleSpeed;
                else
                    this.fr_paddle_y = 0;
            }
            else {
                if (this.sec_paddle_y - this.paddleSpeed > 0)
                    this.sec_paddle_y -= this.paddleSpeed;
                else
                    this.sec_paddle_y = 0;
            }
        }
    }
    player_activity(payload) {
        if (this.state === "scored" && payload.input === "ENTER")
            this.initGame(payload.id);
        else if (payload.input !== "ENTER")
            this.update_paddles(payload);
    }
    queue_status() {
        return {
            ball_x: this.ball_x,
            ball_y: this.ball_y,
            ball_direction_x: this.ball_direction_x,
            ball_direction_y: this.ball_direction_y,
            ball_speed: this.ball_speed,
            fr_paddle_x: this.fr_paddle_x,
            fr_paddle_y: this.fr_paddle_y,
            sec_paddle_x: this.sec_paddle_x,
            sec_paddle_y: this.sec_paddle_y,
            state: this.state,
            players: this.players,
            players_avatar: this.players_avatar,
            players_names: this.players_names,
            users: this.users,
            users_names: this.users_names,
            scores: this.scores,
            score_limit: this.score_limit,
            winner: this.winner,
            winner_name: this.winner_name,
            lastscored: this.lastscored,
            width: this.width,
            height: this.height,
            aspectRatio: this.aspectRatio,
            paddle_height: this.paddle_height,
            paddle_width: this.paddle_width,
            ball_radius: this.ball_radius
        };
    }
}
let AppGateway = class AppGateway {
    constructor(jwtService, prismaService) {
        this.jwtService = jwtService;
        this.prismaService = prismaService;
        this.logger = new common_1.Logger("AppGateway");
        this.GameMode = Array();
        this.queues = Array();
        this.live_games = Array();
        this.cpt = 0;
        this.socket_with_queue_id = new Map();
        this.user_with_queue_id = new Map();
        this.user_with_queue_mode = new Map();
        this.user_with_game_id = new Map();
    }
    afterInit(server) {
        this.server = server;
        if (this.GameMode.length === 0) {
            for (let i = 0; i < 4; i++) {
                this.GameMode.push(new mode_du_game());
                this.GameMode[i] = new mode_du_game();
                this.GameMode[i].queues = new Array();
            }
        }
    }
    async handleConnection(client, payload) {
        const user = await this.getUserFromSocket(client);
        const user_status = "ON";
        const off_status = "OFF";
        if (user) {
            const game_history = await this.prismaService.game.findMany({
                where: { user1_id: user.id }
            });
        }
    }
    async handleDisconnect(player_ref) {
    }
    async update_user_achievements(user, achievement) {
        try {
            if (!user.achievements.includes(achievement)) {
                const updated_user = await this.prismaService.user.update({
                    where: { id: user.id },
                    data: {
                        achievements: {
                            push: achievement,
                        },
                    },
                });
                return updated_user;
            }
            return user;
        }
        catch (_a) {
            throw new common_1.HttpException('Error while updating achievements', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async user_achievements(user_id) {
        try {
            let user = await this.get_user(user_id);
            const winrate = (user.win / (user.win + user.lose)) * 100;
            if (user.win_streak >= 10) {
                user = await this.update_user_achievements(user, client_1.Achievement.TEN_WIN_STREAK);
            }
            else if (user.win_streak >= 5) {
                user = await this.update_user_achievements(user, client_1.Achievement.FIVE_WIN_STREAK);
            }
            if (winrate >= 80) {
                user = await this.update_user_achievements(user, client_1.Achievement.LEGEND_WIRATE);
            }
            else if (winrate >= 60) {
                user = await this.update_user_achievements(user, client_1.Achievement.GREAT_WIRATE);
            }
            else if (winrate >= 50) {
                user = await this.update_user_achievements(user, client_1.Achievement.DECENT_WIRATE);
            }
            else {
                user = await this.update_user_achievements(user, client_1.Achievement.GREAT_LOSER);
            }
        }
        catch (_a) {
            throw new common_1.HttpException('Error while updating achievements', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async Game_stopped(player_ref) {
        const player_id = this.socket_with_queue_id.get(player_ref.id);
        const user = await this.getUserFromSocket(player_ref);
        if (user) {
            const user_id = this.user_with_queue_id.get(user.id);
            const q_mode = this.user_with_queue_mode.get(user.id);
            const user_status = "INQUEUE";
            const on_status = "ON";
            if (user.id === this.GameMode[q_mode].queues[user_id].users[0])
                this.GameMode[q_mode].queues[user_id].update_winner(this.GameMode[q_mode].queues[user_id].users[0], this.GameMode[q_mode].queues[user_id].users_names[1]);
            else
                this.GameMode[q_mode].queues[user_id].update_winner(this.GameMode[q_mode].queues[user_id].users[1], this.GameMode[q_mode].queues[user_id].users_names[0]);
            this.GameMode[q_mode].queues[user_id].update_status("ended");
            this.GameMode[q_mode].queues[user_id].emit_and_clear();
            for (let i = 0; i < this.GameMode[q_mode].queues[user_id].players.length; i++)
                this.socket_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].players[i]);
            const user1 = await this.prismaService.user.findUnique({
                where: { id: this.GameMode[q_mode].queues[user_id].users[0] }
            });
            const user2 = await this.prismaService.user.findUnique({
                where: { id: this.GameMode[q_mode].queues[user_id].users[1] }
            });
            if (user1.id === user.id) {
                await this.prismaService.user.update({
                    where: { id: user2.id },
                    data: {
                        win: user2.win + 1,
                        win_streak: user2.win_streak + 1,
                        status: "ON",
                    }
                });
                await this.prismaService.user.update({
                    where: { id: user1.id },
                    data: {
                        lose: user1.lose + 1,
                        win_streak: 0,
                        status: "ON",
                    }
                });
            }
            else {
                await this.prismaService.user.update({
                    where: { id: user1.id },
                    data: {
                        win: user1.win + 1,
                        win_streak: user1.win_streak + 1,
                        status: "ON",
                    }
                });
                await this.prismaService.user.update({
                    where: { id: user2.id },
                    data: {
                        lose: user2.lose + 1,
                        win_streak: 0,
                        status: "ON",
                    }
                });
            }
            const games = await this.prismaService.game.findMany({
                where: {
                    OR: [
                        { user1: { id: this.GameMode[q_mode].queues[user_id].users[0] } },
                        { user2: { id: this.GameMode[q_mode].queues[user_id].users[1] } }
                    ]
                },
                take: 1,
                orderBy: {
                    id: 'desc'
                },
            });
            const updatedGame = await this.prismaService.game.update({
                where: { id: games[0].id },
                data: { user1_score: this.GameMode[q_mode].queues[user_id].scores[0],
                    user2_score: this.GameMode[q_mode].queues[user_id].scores[1] }
            });
            this.get_user_score(user1.id);
            this.get_user_score(user2.id);
            this.user_achievements(user1.id);
            this.user_achievements(user2.id);
            this.user_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].users[0]);
            this.user_with_queue_id.delete(this.GameMode[q_mode].queues[user_id].users[1]);
            this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[user_id].users[0]);
            this.user_with_queue_mode.delete(this.GameMode[q_mode].queues[user_id].users[1]);
            let game_len = this.GameMode[q_mode].queues[user_id].players.length;
            if (game_len >= 2) {
                await this.edit_user_status(this.GameMode[q_mode].queues[user_id].users[0], on_status);
                await this.edit_user_status(this.GameMode[q_mode].queues[user_id].users[1], on_status);
            }
            else {
                await this.edit_user_status(user.id, on_status);
            }
        }
    }
    spectJoinRoom(socket) {
        let j = 0;
        let spect_array = Array();
        for (let x = 0; x < this.GameMode.length; x++) {
            for (let i = 0; i < this.GameMode[x].queues.length; i++) {
                if (this.GameMode[x].queues[i].state === "play" || this.GameMode[x].queues[i].state === "scored"
                    || this.GameMode[x].queues[i].state === "matched") {
                    spect_array.push(new for_spect());
                    spect_array[spect_array.length - 1].user_1_name = this.GameMode[x].queues[i].users_names[0];
                    spect_array[spect_array.length - 1].user_2_name = this.GameMode[x].queues[i].users_names[1];
                    spect_array[spect_array.length - 1].user_1_score = this.GameMode[x].queues[i].scores[0];
                    spect_array[spect_array.length - 1].user_2_score = this.GameMode[x].queues[i].scores[1];
                    spect_array[spect_array.length - 1].user_1_avatar = this.GameMode[x].queues[i].players_avatar[0];
                    spect_array[spect_array.length - 1].user_2_avatar = this.GameMode[x].queues[i].players_avatar[1];
                    spect_array[spect_array.length - 1].index = x;
                    j++;
                }
            }
        }
        socket.emit('gameCount', spect_array);
    }
    spectJoin(socket, payload) {
        let j = 0;
        let y = 0;
        let game_type = -1;
        if (payload.value !== -1) {
            for (let x = 0; x < this.GameMode.length; x++) {
                for (let i = 0; i < this.GameMode[x].queues.length; i++) {
                    if (this.GameMode[x].queues[i].state === "play" || this.GameMode[x].queues[i].state === "scored"
                        || this.GameMode[x].queues[i].state === "matched") {
                        j++;
                        if (j.toString() === payload.value) {
                            y = i;
                            game_type = x;
                        }
                    }
                }
            }
            if (game_type !== -1)
                socket.join(this.GameMode[game_type].queues[y].room);
            else
                socket.emit('spect_game_ended', 0);
        }
        else if (this.GameMode[0].queues.length > 0)
            socket.join(this.GameMode[0].queues[0].room);
    }
    async get_user(req_id) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: req_id,
            },
        });
        return user;
    }
    async update_user_score(user, score) {
        try {
            const updated_user = await this.prismaService.user.update({
                where: { id: user.id },
                data: {
                    score: score,
                },
            });
            return updated_user;
        }
        catch (_a) {
            throw new common_1.HttpException('Error while updating score', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async get_user_score(user_id) {
        try {
            const user = await this.get_user(user_id);
            const win = user.win;
            const lose = user.lose;
            let score = 0;
            const winrate = (win / (win + lose)) * 100;
            if (winrate >= 80) {
                score = win * 300 - lose * 100 + 1000;
            }
            else if (winrate >= 60) {
                score = win * 300 - lose * 100 + 500;
            }
            else if (winrate >= 50) {
                score = win * 300 - lose * 100 + 200;
            }
            else {
                score = win * 300 - lose * 100;
            }
            const updated_user = await this.update_user_score(user, score);
            return (updated_user.score);
        }
        catch (_a) {
            throw new common_1.HttpException('Error while updating score', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async GameEnded(socket, payload) {
        const user = await this.getUserFromSocket(socket);
        const user_id = this.user_with_queue_id.get(user.id);
        const user_mode = this.user_with_queue_mode.get(user.id);
        if (user) {
            const gameox = await this.prismaService.game.findUnique({
                where: { id: this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0]) }
            });
            if (gameox.status !== client_1.StatusGame.FINISHED &&
                this.GameMode[user_mode].queues[user_id].state !== "ended") {
                const updatedGame = await this.prismaService.game.update({
                    where: { id: this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0]) },
                    data: { user1_score: this.GameMode[user_mode].queues[user_id].scores[0],
                        user2_score: this.GameMode[user_mode].queues[user_id].scores[1],
                        status: client_1.StatusGame.FINISHED, }
                });
                const user1 = await this.prismaService.user.findUnique({
                    where: { id: this.GameMode[user_mode].queues[user_id].users[0] }
                });
                const user2 = await this.prismaService.user.findUnique({
                    where: { id: this.GameMode[user_mode].queues[user_id].users[1] }
                });
                if (user.id === this.GameMode[user_mode].queues[user_id].users[0])
                    this.GameMode[user_mode].queues[user_id].update_winner(this.GameMode[user_mode].queues[user_id].users[0], this.GameMode[user_mode].queues[user_id].users_names[1]);
                else
                    this.GameMode[user_mode].queues[user_id].update_winner(this.GameMode[user_mode].queues[user_id].users[1], this.GameMode[user_mode].queues[user_id].users_names[0]);
                this.GameMode[user_mode].queues[user_id].update_status("ended");
                this.GameMode[user_mode].queues[user_id].emit_and_clear();
                for (let i = 0; i < this.GameMode[user_mode].queues[user_id].players.length; i++)
                    this.socket_with_queue_id.delete(this.GameMode[user_mode].queues[user_id].players[i]);
                if (this.GameMode[user_mode].queues[user_id].scores[0] === this.GameMode[user_mode].queues[user_id].score_limit) {
                    await this.prismaService.user.update({
                        where: { id: user1.id },
                        data: {
                            win: user1.win + 1,
                            win_streak: user1.win_streak + 1,
                            status: "ON",
                        }
                    });
                    await this.prismaService.user.update({
                        where: { id: user2.id },
                        data: {
                            lose: user2.lose + 1,
                            win_streak: 0,
                            status: "ON",
                        }
                    });
                }
                else if (this.GameMode[user_mode].queues[user_id].scores[1] === this.GameMode[user_mode].queues[user_id].score_limit) {
                    await this.prismaService.user.update({
                        where: { id: user2.id },
                        data: {
                            win: user2.win + 1,
                            win_streak: user2.win_streak + 1,
                            status: "ON",
                        }
                    });
                    await this.prismaService.user.update({
                        where: { id: user1.id },
                        data: {
                            lose: user1.lose + 1,
                            win_streak: 0,
                            status: "ON",
                        }
                    });
                }
                else {
                    if (user1.id === user.id) {
                        await this.prismaService.user.update({
                            where: { id: user2.id },
                            data: {
                                win: user2.win + 1,
                                win_streak: user2.win_streak + 1,
                                status: "ON",
                            }
                        });
                        await this.prismaService.user.update({
                            where: { id: user1.id },
                            data: {
                                lose: user1.lose + 1,
                                win_streak: 0,
                                status: "ON",
                            }
                        });
                    }
                    else {
                        await this.prismaService.user.update({
                            where: { id: user1.id },
                            data: {
                                win: user1.win + 1,
                                win_streak: user1.win_streak + 1,
                                status: "ON",
                            }
                        });
                        await this.prismaService.user.update({
                            where: { id: user2.id },
                            data: {
                                lose: user2.lose + 1,
                                win_streak: 0,
                                status: "ON",
                            }
                        });
                    }
                }
                this.GameMode[user_mode].queues[user_id].scores[0] = 0;
                this.GameMode[user_mode].queues[user_id].scores[1] = 0;
                this.get_user_score(this.GameMode[user_mode].queues[user_id].users[0]);
                this.get_user_score(this.GameMode[user_mode].queues[user_id].users[1]);
                this.user_achievements(this.GameMode[user_mode].queues[user_id].users[0]);
                this.user_achievements(this.GameMode[user_mode].queues[user_id].users[1]);
                this.user_with_queue_id.delete(this.GameMode[user_mode].queues[user_id].users[0]);
                this.user_with_queue_id.delete(this.GameMode[user_mode].queues[user_id].users[1]);
                this.user_with_queue_mode.delete(this.GameMode[user_mode].queues[user_id].users[0]);
                this.user_with_queue_mode.delete(this.GameMode[user_mode].queues[user_id].users[1]);
            }
        }
    }
    async edit_user_status(user_id, status) {
        await this.prismaService.user.update({
            where: { id: user_id },
            data: {
                status: status,
            }
        });
    }
    async get_match_history(socket) {
        const user = await this.getUserFromSocket(socket);
        if (user) {
            const game_history = await this.prismaService.game.findMany({
                where: { user1_id: user.id }
            });
        }
    }
    async get_user_status(user_id) {
        const user = await this.prismaService.user.findUnique({
            where: { id: user_id }
        });
        const user_status = user.status;
        return (user_status);
    }
    async invite_qu(socket, payload) {
        const user = await this.getUserFromSocket(socket);
        const user_status = "INQUEUE";
        const game_status = "INGAME";
        if (user) {
            const room_id = user.id;
            let i = payload.mode - 1;
            if (!this.user_with_queue_id.has(user.id) && payload.state !== 3) {
                this.getUserFromSocket(socket);
                let size = this.GameMode[payload.mode - 1].queues.length;
                let nadi = 0;
                if (payload.state !== 0) {
                    if (payload.state === 1) {
                        if (size === 0) {
                            this.GameMode[i].queues.push(new Game(this.server));
                            this.GameMode[i].queues[0].update_room(room_id);
                            socket.join(room_id);
                            size = 1;
                            nadi = 1;
                        }
                        else if (size !== 0) {
                            this.GameMode[i].queues.push(new Game(this.server));
                            size = this.GameMode[payload.mode - 1].queues.length;
                            this.GameMode[i].queues[size - 1].update_room(room_id);
                            socket.join(room_id);
                            nadi = 1;
                        }
                    }
                    else if (payload.state === 2) {
                        if ((size - 1) === 0) {
                            socket.join(this.GameMode[i].queues[0].room);
                        }
                        else {
                            for (let x = size - 1; x > 0; x--) {
                                if (this.GameMode[i].queues[x].users[1] === user.id) {
                                    socket.join(this.GameMode[i].queues[x].room);
                                }
                            }
                        }
                    }
                    this.GameMode[i].queues[size - 1].players_avatar.push(user.avatar);
                    this.GameMode[i].queues[size - 1].players_names.push(user.username);
                    this.GameMode[i].queues[size - 1].push_players(socket.id, user.avatar, user.username);
                    this.GameMode[i].queues[size - 1].push_users(user.id, user.username);
                    this.GameMode[i].queues[size - 1].check_players_are_ready();
                    this.socket_with_queue_id.set(socket.id, size - 1);
                    this.user_with_queue_id.set(user.id, size - 1);
                    this.user_with_queue_mode.set(user.id, i);
                    if (payload.state === 1)
                        this.GameMode[i].queues[size - 1].users.push(payload.player);
                }
                if (payload.state === 0) {
                    if (this.GameMode[i].queues.length > 0) {
                        this.GameMode[i].queues[size - 1].update_status("decline");
                        this.GameMode[i].queues[size - 1].emit_and_clear();
                        this.user_with_queue_id.delete(this.GameMode[i].queues[size - 1].users[0]);
                        this.user_with_queue_mode.delete(this.GameMode[i].queues[size - 1].users[0]);
                        await this.edit_user_status(this.GameMode[i].queues[size - 1].users[0], "ON");
                        await this.edit_user_status(this.GameMode[i].queues[size - 1].users[1], "ON");
                    }
                }
                else if (this.GameMode[i].queues[size - 1].players_names.length === 2 && payload.state === 2) {
                    console.log("Here tani");
                    const game_modes = ["MODE1", "MODE2", "MODE3", "MODE2"];
                    const game = await this.prismaService.game.create({
                        data: {
                            user1: { connect: { id: this.GameMode[i].queues[size - 1].users[0] } },
                            user2: { connect: { id: this.GameMode[i].queues[size - 1].users[1] } },
                            user1_score: 0,
                            user2_score: 0,
                            mode: game_modes[i],
                            status: client_1.StatusGame.PLAYING,
                        }
                    });
                    this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[0], game.id);
                    this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[1], game.id);
                    this.GameMode[i].queues[size - 1].user_with_game_id = this.user_with_game_id;
                }
            }
            else if (this.user_with_queue_id.has(user.id)) {
                const user_id = this.user_with_queue_id.get(user.id);
                this.GameMode[3].queues[user_id].players.push(socket.id);
                socket.join(this.GameMode[3].queues[user_id].room);
            }
        }
    }
    async joinRoom(socket, payload) {
        const user = await this.getUserFromSocket(socket);
        const user_status = "INQUEUE";
        const game_status = "INGAME";
        if (user) {
            const room_id = user.id;
            let i = payload.mode - 1;
            if (!this.user_with_queue_id.has(user.id) && payload.state === 1) {
                this.getUserFromSocket(socket);
                let size = this.GameMode[payload.mode - 1].queues.length;
                await this.edit_user_status(user.id, user_status);
                if (size === 0) {
                    this.GameMode[i].queues.push(new Game(this.server));
                    this.GameMode[i].queues[0].update_room(room_id);
                    socket.join(room_id);
                    size = 1;
                }
                else if (this.GameMode[i].queues[size - 1].state === "ended") {
                    this.GameMode[i].queues.push(new Game(this.server));
                    size = this.GameMode[i].queues.length;
                    this.GameMode[i].queues[size - 1].update_room(room_id);
                    socket.join(room_id);
                }
                else if (this.GameMode[i].queues[size - 1].users.length === 2) {
                    this.GameMode[i].queues.push(new Game(this.server));
                    size = this.GameMode[payload.mode - 1].queues.length;
                    this.GameMode[i].queues[size - 1].update_room(room_id);
                    socket.join(room_id);
                }
                else if (this.GameMode[i].queues[size - 1].users.length === 1) {
                    socket.join(this.GameMode[i].queues[size - 1].room);
                    this.cpt++;
                }
                this.GameMode[i].queues[size - 1].players_avatar.push(user.avatar);
                this.GameMode[i].queues[size - 1].players_names.push(user.username);
                this.GameMode[i].queues[size - 1].push_players(socket.id, user.avatar, user.username);
                this.GameMode[i].queues[size - 1].push_users(user.id, user.username);
                this.GameMode[i].queues[size - 1].check_players_are_ready();
                this.socket_with_queue_id.set(socket.id, size - 1);
                this.user_with_queue_id.set(user.id, size - 1);
                this.user_with_queue_mode.set(user.id, i);
                if (this.GameMode[i].queues[size - 1].users_names.length === 2) {
                    const game_modes = ["MODE1", "MODE2", "MODE3"];
                    const game = await this.prismaService.game.create({
                        data: {
                            user1: { connect: { id: this.GameMode[i].queues[size - 1].users[0] } },
                            user2: { connect: { id: this.GameMode[i].queues[size - 1].users[1] } },
                            user1_score: 0,
                            user2_score: 0,
                            mode: game_modes[i],
                            status: client_1.StatusGame.PLAYING,
                        }
                    });
                    this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[0], game.id);
                    this.user_with_game_id.set(this.GameMode[i].queues[size - 1].users[1], game.id);
                    this.GameMode[i].queues[size - 1].user_with_game_id = this.user_with_game_id;
                }
            }
            else if (this.user_with_queue_id.has(user.id)) {
                const user_id = this.user_with_queue_id.get(user.id);
                const us_mode = this.user_with_queue_mode.get(user.id);
                this.GameMode[us_mode].queues[user_id].players.push(socket.id);
                socket.join(this.GameMode[us_mode].queues[user_id].room);
            }
        }
    }
    async handlePlayerInput(player_ref, payload) {
        const player_id = this.socket_with_queue_id.get(player_ref.id);
        let x = 0;
        const user = await this.getUserFromSocket(player_ref);
        const user_id = this.user_with_queue_id.get(user.id);
        const user_mode = this.user_with_queue_mode.get(user.id);
        let i = payload.mode - 1;
        if (payload.input === "ENTER") {
            if (this.GameMode[user_mode].queues[user_id].ball_speed === 0) {
                if (payload.mode === 1)
                    this.GameMode[user_mode].queues[user_id].ball_speed = 0.75;
                else if (payload.mode === 2 || payload.mode === 4)
                    this.GameMode[user_mode].queues[user_id].ball_speed = 0.25;
                else if (payload.mode === 3)
                    this.GameMode[user_mode].queues[user_id].ball_speed = 2.75;
                x = 1;
                this.GameMode[user_mode].queues[user_id].state = "play";
            }
            else {
                if (user) {
                    const user1_id = this.user_with_game_id.get(this.GameMode[user_mode].queues[user_id].users[0]);
                    const games = await this.prismaService.game.findMany({
                        where: {
                            OR: [
                                { user1: { id: this.GameMode[user_mode].queues[user_id].users[0] } },
                                { user2: { id: this.GameMode[user_mode].queues[user_id].users[1] } }
                            ]
                        },
                        take: 1,
                        orderBy: {
                            id: 'desc'
                        },
                    });
                    const updatedGame = await this.prismaService.game.update({
                        where: { id: games[0].id },
                        data: { user1_score: this.GameMode[user_mode].queues[user_id].scores[0],
                            user2_score: this.GameMode[user_mode].queues[user_id].scores[1] }
                    });
                }
            }
        }
        if (x !== 1) {
            this.GameMode[user_mode].queues[user_id].player_activity(Object.assign(Object.assign({}, payload), { id: user.id }));
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
};
__decorate([
    (0, websockets_1.SubscribeMessage)('Game_Stopped'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "Game_stopped", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('spectJoined'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "spectJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('spectJoin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], AppGateway.prototype, "spectJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('GameEnded'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "GameEnded", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('History'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "get_match_history", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite_queue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "invite_qu", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('player_join_queue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "joinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('player_pressed_key'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AppGateway.prototype, "handlePlayerInput", null);
AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)(4000, {
        cors: {
            credentials: true,
            origin: 'http://localhost:3000',
        }
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], AppGateway);
exports.AppGateway = AppGateway;
//# sourceMappingURL=app.gateway.js.map