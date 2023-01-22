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
exports.JwtGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
let JwtGuard = class JwtGuard {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
    }
    canActivate(context) {
        const verifyOptions = { secret: this.config.get('JWT_SECRET') };
        const request = context.switchToHttp().getRequest();
        const jwt_token = request.cookies['access_token'];
        try {
            const user_obj = this.jwtService.verify(jwt_token, verifyOptions);
            request.user_obj = user_obj;
            return user_obj ? true : false;
        }
        catch (_a) {
            throw new common_1.HttpException("Invalid access token!", common_1.HttpStatus.UNAUTHORIZED);
        }
    }
};
JwtGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService, config_1.ConfigService])
], JwtGuard);
exports.JwtGuard = JwtGuard;
//# sourceMappingURL=jwt.guard.js.map