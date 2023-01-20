"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionHeaderInterceptor = void 0;
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const cookieParser = require("cookie-parser");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
let VersionHeaderInterceptor = class VersionHeaderInterceptor {
    intercept(context, next) {
        if (context.getType() === 'http') {
            const http = context.switchToHttp();
            const response = http.getResponse();
            response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
            response.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        return next.handle();
    }
};
VersionHeaderInterceptor = __decorate([
    (0, common_1.Injectable)()
], VersionHeaderInterceptor);
exports.VersionHeaderInterceptor = VersionHeaderInterceptor;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(cookieParser());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Transcendence')
        .setDescription('Transcendence API description')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    app.useGlobalInterceptors(new VersionHeaderInterceptor());
    app.enableCors({
        origin: 'http://localhost:3000',
        methods: ["GET", "PATCH", "POST", "PUT", "DELETE"],
        credentials: true,
        allowedHeaders: ["cookie", "Cookie", "authorization", "Authorization", "content-type"],
        exposedHeaders: ["cookie", "Cookie", "authorization", "Authorization", "content-type"],
    });
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    await app.listen(5000);
}
bootstrap();
//# sourceMappingURL=main.js.map