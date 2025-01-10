
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { IJwtPayload } from '../types/auth.type';
import { AuthService } from '../services/auth.service';
import { getCookieConfig } from 'src/common/helpers/cookie';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly configService: ConfigService,
        private authService: AuthService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();
        const accessToken = request.headers.authorization; // Extract Bearer token
        const refreshToken = request.cookies.refreshToken;

        if (!accessToken) {
            throw new UnauthorizedException('Access token is missing');
        }

        const ACCESS_TOKEN_PRIVATE_KEY = this.configService.get<string>('ACCESS_TOKEN_PRIVATE_KEY');
        if (!ACCESS_TOKEN_PRIVATE_KEY) {
            throw new UnauthorizedException('Token private key is not configured');
        }

        try {
            const payload = await this.verifyAccessToken(accessToken, ACCESS_TOKEN_PRIVATE_KEY);
            request['user'] = payload; // Attach user info to the request object
            return true;
        } catch (err) {
            if (err.name === 'TokenExpiredError' && refreshToken) {
                return this.handleTokenRefresh(refreshToken, request, response);
            }
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    private async verifyAccessToken(token: string, secret: string): Promise<IJwtPayload> {
        return this.jwtService.verifyAsync<IJwtPayload>(token, { secret });
    }

    private async handleTokenRefresh(refreshToken: string, request: Request, response: Response): Promise<boolean> {
        try {
            const newTokens = await this.authService.refresh(refreshToken);
            response
                .cookie('refreshToken', newTokens.refreshToken, getCookieConfig(24)) // 24 hours expiry
                .header('Authorization', newTokens.accessToken);

            const decodedAccessToken = await this.jwtService.decode(newTokens.accessToken) as IJwtPayload;
            request['user'] = decodedAccessToken; // Attach the refreshed user info to the request object
            return true;
        } catch (error) {
            throw new UnauthorizedException('Unable to refresh token');
        }
    }
}
