import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GameModule } from './game/app.module';
import { ChatModule } from './chat/chat.module';
import { AppGateway } from './app.gateway';
import { UserService } from './user/user.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    GameModule,
    ChatModule,
    PrismaModule,
    JwtModule,
  ],
  providers: [AppGateway, UserService, ConfigService]
})
export class AppModule {}
