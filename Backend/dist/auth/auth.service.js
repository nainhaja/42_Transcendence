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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const otplib_1 = require("otplib");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const qrcode_1 = require("qrcode");
const dto_1 = require("../user/dto");
let AuthService = class AuthService {
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
    }
    async login(req, res) {
        try {
            const payload = {
                id: req.user.id,
            };
            console.log("zabiiii" + this.prisma.user.count({
                where: {
                    id: req.user.id,
                }
            }));
            const nb_user = await this.prisma.user.count({
                where: {
                    id: req.user.id,
                }
            });
            const zero = 0;
            if (nb_user === 0) {
                const user = await this.prisma.user.create({
                    data: {
                        id: req.user.id,
                        full_name: req.user.full_name,
                        username: req.user.username,
                        avatar: req.user.avatar,
                        is_two_fa_enable: false,
                        email: req.user.email,
                        status: client_1.UserStatus.ON,
                        win: 0,
                        lose: 0,
                        score: 0,
                        win_streak: 0,
                    }
                });
                const secret = this.config.get('JWT_SECRET');
                const access_token = await this.jwt.sign(payload, {
                    expiresIn: '1d',
                    secret: secret,
                });
                res.cookie('access_token', access_token, { httpOnly: true }).status(200);
                res.json({ message: "success!" });
            }
            else if (nb_user === 1) {
                const secret = this.config.get('JWT_SECRET');
                const access_token = await this.jwt.sign(payload, {
                    expiresIn: '1d',
                    secret: secret,
                });
                req.res.cookie('access_token', access_token, {
                    httpOnly: true,
                    path: '/',
                });
                req.res.redirect(`http://localhost:3000/`);
            }
        }
        catch (error) {
            console.log("my error uis " + error);
            throw new common_1.HttpException("Login failed!", 400);
        }
    }
    async generate_2fa_secret(user, res) {
        if (await this.prisma.user.findUnique({
            where: {
                id: user.id,
            }
        })) {
            this.enable_2fa(user, res);
            const secret = otplib_1.authenticator.generateSecret();
            const otpauthUrl = otplib_1.authenticator.keyuri(user.email, this.config.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
            this.save_secret_db(user, secret);
            return ({
                secret,
                otpauthUrl
            });
        }
        else {
            throw new common_1.HttpException("User not found!", 400);
        }
    }
    async save_secret_db(user, secret) {
        const updated_user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                two_fa_code: secret,
            }
        });
    }
    async pipeQrCodeStream(res, otpauthUrl) {
        return (0, qrcode_1.toFileStream)(res, otpauthUrl);
    }
    async enable_2fa(user, res) {
        try {
            if (user.is_two_fa_enable === true)
                res.json({ message: "2fa is already enabled!" });
            else {
                const updated_user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        is_two_fa_enable: true,
                    }
                });
            }
        }
        catch (_a) {
            throw new common_1.HttpException("Failed to enable 2fa!", 400);
        }
    }
    async disable_2fa(user, res) {
        try {
            if (user.is_two_fa_enable === false)
                res.json({ message: "2fa is already disabled!" });
            else {
                const updated_user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        is_two_fa_enable: false,
                    }
                });
                res.json({ message: "success!" });
            }
        }
        catch (_a) {
            throw new common_1.HttpException("Failed to disable 2fa!", 400);
        }
    }
    async verify_2fa(req, res, param) {
        const user = await this.get_user(req.user_obj.id);
        if (user.is_two_fa_enable === false) {
            throw new common_1.HttpException("2fa is not enable!", 400);
        }
        const is_2fa_code_valid = otplib_1.authenticator.verify({
            token: param.two_fa_code,
            secret: user.two_fa_code,
        });
        if (!is_2fa_code_valid)
            throw new common_1.HttpException("Invalid 2fa code!", 400);
        res.json({ message: "2fa code is valid!" });
    }
    async get_user(req_id) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: req_id,
            }
        });
        return user;
    }
};
__decorate([
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "login", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "generate_2fa_secret", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "pipeQrCodeStream", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "enable_2fa", null);
__decorate([
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "disable_2fa", null);
__decorate([
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "verify_2fa", null);
AuthService = __decorate([
    (0, common_1.Injectable)({}),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService, jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map