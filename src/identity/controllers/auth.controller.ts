import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from 'src/common/helpers/api-response';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { getCookieConfig } from 'src/common/helpers/cookie';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // User login
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const tokens = await this.authService.login(loginDto);
        const payload = ApiResponse.success<null>('Logged in successfully', null);
        res.cookie('refreshToken', tokens.refreshToken, getCookieConfig(24))
        .header('Authorization', tokens.accessToken)
        .status(200).json(payload);
    }

    // User logout
    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies['refreshToken'];
        await this.authService.logout(refreshToken);
        res.cookie('refreshToken', 'deleted', getCookieConfig(0))
        .status(200)
        .json(ApiResponse.success<null>('Logged out successfully', null))
    }
}
