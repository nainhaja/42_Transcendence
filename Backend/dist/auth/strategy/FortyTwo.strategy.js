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
exports.FortyTwoStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../../prisma/prisma.service");
const passport_42_1 = require("passport-42");
const config_1 = require("@nestjs/config");
let FortyTwoStrategy = class FortyTwoStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor(prisma, config) {
        super({
            clientID: config.get('CLIENT_ID'),
            clientSecret: config.get('CLIENT_SECRET'),
            callbackURL: config.get('CALLBACK_URL'),
            passReqToCallback: true,
        });
        this.prisma = prisma;
        this.config = config;
    }
    async validate(req, accessToken, refreshToken, profile, cb) {
        const user = {
            id: profile.id,
            username: profile.username,
            full_name: profile.displayName,
            avatar: profile._json.image.link,
            email: profile.emails[0].value,
        };
        return user;
    }
};
FortyTwoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService])
], FortyTwoStrategy);
exports.FortyTwoStrategy = FortyTwoStrategy;
//# sourceMappingURL=FortyTwo.strategy.js.map