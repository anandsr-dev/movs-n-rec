
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IJwtPayload } from '../types/auth.type';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const accessToken = request.headers.authorization?.split(' ')[1]; // Extract Bearer token

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
            throw new UnauthorizedException('Invalid or expired access token');
        }
    }

    private async verifyAccessToken(token: string, secret: string): Promise<IJwtPayload> {
        return this.jwtService.verifyAsync<IJwtPayload>(token, { secret });
    }
}
