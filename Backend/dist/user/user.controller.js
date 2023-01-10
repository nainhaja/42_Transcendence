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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const guard_1 = require("../auth/guard");
const guard_2 = require("./guard");
const user_service_1 = require("./user.service");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const platform_express_1 = require("@nestjs/platform-express");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    signin(req) {
        this.userService.edit_user_status(req.user_obj, client_1.UserStatus.ON);
        return req.user_obj;
    }
    change_username(req, new_username, res) {
        return this.userService.change_username(req.user_obj, new_username, res);
    }
    get_user_score(req, res) {
        return this.userService.get_user_score(req.user_obj, res);
    }
    logout(req, res) {
        this.userService.edit_user_status(req.user_obj, client_1.UserStatus.OFF);
        res.clearCookie('access_token');
    }
    edit_user_status(req) {
        return this.userService.edit_user_status(req.user_obj, client_1.UserStatus.INQUEUE);
    }
    get_user_achievements(req, res) {
        return this.userService.get_user_achievements(req.user_obj, res);
    }
    get_leaderboard(res) {
        return this.userService.get_leaderboard(res);
    }
    get_user_friends(req, res) {
        return this.userService.get_user_friends(req.user_obj, res);
    }
    add_friend(req, param, res) {
        return this.userService.add_friend(req.user_obj, param.friend_name, res);
    }
    async upload(req, file) {
        return await this.userService.upload(req.user_obj, file);
    }
};
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('/'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "signin", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Patch)('edit_username/:new_username'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('new_username')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "change_username", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('user_score'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_user_score", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)('in_queue'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "edit_user_status", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('achievements'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_user_achievements", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('leaderboard'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_leaderboard", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Get)('friends'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "get_user_friends", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)('add_friend/:friend_name'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], UserController.prototype, "add_friend", null);
__decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipeBuilder()
        .addFileTypeValidator({
        fileType: '.(png|jpeg|jpg|gif|svg|bmp|webp)',
    })
        .addMaxSizeValidator({
        maxSize: 10 * 1000000,
    })
        .build({
        errorHttpStatusCode: common_1.HttpStatus.UNAUTHORIZED,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "upload", null);
UserController = __decorate([
    (0, swagger_1.ApiTags)('user'),
    (0, common_1.UseGuards)(guard_2.LocalAuthGuard),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map