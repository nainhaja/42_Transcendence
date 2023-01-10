import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
export declare class JwtGuard implements CanActivate {
    private readonly jwtService;
    private readonly config;
    constructor(jwtService: JwtService, config: ConfigService);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
