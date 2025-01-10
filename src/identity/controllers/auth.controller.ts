import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from 'src/common/helpers/api-response';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { getCookieConfig } from 'src/common/helpers/cookie';
import { REFRESH_COOKIE_KEY } from 'src/common/constants/general';
import { ApiBadRequestResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { LOGIN_RESPONSE_MESSAGES, LOGOUT_RESPONSE_MESSAGES } from 'src/identity/constants/api';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // User login
    @Post('login')
    @HttpCode(200)
    @ApiOkResponse({ description: LOGIN_RESPONSE_MESSAGES.LOGGED_IN })
    @ApiBadRequestResponse({ description: LOGIN_RESPONSE_MESSAGES.USER_NOT_EXIST })
    @ApiUnauthorizedResponse({ description: LOGIN_RESPONSE_MESSAGES.INVALID_PASSWORD })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const tokens = await this.authService.login(loginDto);
        const payload = ApiResponse.success<null>(LOGIN_RESPONSE_MESSAGES.LOGGED_IN, null);
        res.cookie(REFRESH_COOKIE_KEY, tokens.refreshToken, getCookieConfig(24))
            .header('Authorization', tokens.accessToken)
            .status(200).json(payload);
    }

    // User logout
    @Post('logout')
    @HttpCode(200)
    @ApiOkResponse({ description: LOGOUT_RESPONSE_MESSAGES.LOGGED_OUT })
    @ApiUnauthorizedResponse({ description: LOGOUT_RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED })
    @ApiUnauthorizedResponse({ description: LOGOUT_RESPONSE_MESSAGES.INVALID_TOKEN })
    async logout(@Req() req: Request, @Res() res: Response) {
        const refreshToken = req.cookies[REFRESH_COOKIE_KEY];
        await this.authService.logout(refreshToken);
        res.cookie(REFRESH_COOKIE_KEY, '', getCookieConfig(0))
            .status(200)
            .json(ApiResponse.success<null>(LOGOUT_RESPONSE_MESSAGES.LOGGED_OUT, null))
    }
}
