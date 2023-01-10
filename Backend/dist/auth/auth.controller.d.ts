import { AuthService } from "./auth.service";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, res: any): Promise<void>;
    generate_qr_code(req: any, res: any): Promise<any>;
    disable_2fa(req: any, res: any): Promise<void>;
    verify_2fa(req: any, res: any, param: any): Promise<void>;
}
