import { Controller, Get, Param, Post, Req, Res, UseGuards} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FortyTwoGuard, JwtGuard } from "src/auth/guard";
import { AuthService } from "./auth.service";
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from "src/prisma/prisma.service";
import { ConfigService } from "@nestjs/config";


@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private prisma: PrismaService, private config: ConfigService,private authService: AuthService){}

    @UseGuards(FortyTwoGuard)
    @Get('login')
    login(@Req() req, @Res() res) {
        return this.authService.login(req, res);
    }

    @UseGuards(JwtGuard)
    @Get('login/2fa/enable')
    async generate_qr_code(@Req() req, @Res() res) {
        const new_user = await this.prisma.user.findUnique({
            where: {
                id : req.user_obj.id
            },
        })
        const { otpauthUrl } = await this.authService.generate_2fa_secret(new_user, res);
        return (this.authService.pipeQrCodeStream(res, otpauthUrl));
    }

    @UseGuards(JwtGuard)
    @Post('login/2fa/disable')
    async disable_2fa(@Req() req, @Res() res) {
        const new_user = await this.prisma.user.findUnique({
            where: {
                id : req.user_obj.id
            },
        })
        console.log(JSON.stringify(new_user))
        return this.authService.disable_2fa(new_user, res);
    }
    // @Get('logout')
    
    @UseGuards(JwtGuard)
    @Post("login/2fa/:two_fa_code")
    verify_2fa(@Req() req, @Res() res, @Param() param) {
        
        return this.authService.verify_2fa(req, res, param);
    }


}
