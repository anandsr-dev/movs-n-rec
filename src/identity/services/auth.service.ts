import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { IJwtPayload, ITokenData } from '../types/auth.type';
import { ConfigService } from '@nestjs/config';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from 'src/common/constants';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }

    async getNewTokens(jwtPayload: IJwtPayload): Promise<ITokenData> {
        const ACCESS_TOKEN_PRIVATE_KEY = this.configService.get('ACCESS_TOKEN_PRIVATE_KEY');
        const REFRESH_TOKEN_PRIVATE_KEY = this.configService.get('REFRESH_TOKEN_PRIVATE_KEY');
        const accessToken = await this.jwtService.signAsync(
            jwtPayload,
            {
                secret: ACCESS_TOKEN_PRIVATE_KEY,
                expiresIn: ACCESS_TOKEN_EXPIRY
            }
        );
        const refreshToken = await this.jwtService.signAsync(
            jwtPayload,
            {
                secret: REFRESH_TOKEN_PRIVATE_KEY,
                expiresIn: REFRESH_TOKEN_EXPIRY
            }
        );
        const decoded = this.jwtService.decode(accessToken);
        return { accessToken, refreshToken, exp: decoded.exp }
    }

    async login(loginDto: LoginDto): Promise<ITokenData> {
        const user = await this.userService.getUser({ username: loginDto.username });
        if (!user) {
            throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
        }
        const validPass = await bcrypt.compare(loginDto.password, user.password);
        if (!validPass) {
            throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
        }
        const tokens = await this.getNewTokens({ userId: user._id.toString(), username: user.username, role: user.role });
        await this.userService.updateUser(user._id.toString(), { refreshToken: tokens.refreshToken });
        return tokens;
    }

    async logout(refreshToken: string) {
        if (!refreshToken) {
            throw new HttpException('Token required', HttpStatus.UNAUTHORIZED);
        }
        const REFRESH_TOKEN_PRIVATE_KEY = this.configService.get('REFRESH_TOKEN_PRIVATE_KEY');
        const decoded = this.jwtService.verify(refreshToken, { secret: REFRESH_TOKEN_PRIVATE_KEY });
        if (!decoded || typeof decoded === 'string') {
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
        await this.userService.updateUser(decoded.userId, { refreshToken: '' });
        return null;
    }

    async refresh(refreshToken: string) {
        const decoded = this.jwtService.decode<IJwtPayload & { iat: number, exp: number }>(refreshToken);
        const user = await this.userService.getUser({ userId: decoded.userId });
        if (!user || !user.refreshToken || (refreshToken !== user.refreshToken)) {
            throw new UnauthorizedException('Invalid refresh token');
        }
        const newTokens = await this.getNewTokens({ username: decoded.username, userId: decoded.userId, role: decoded.role });
        await this.userService.updateUser(decoded.userId, { refreshToken: newTokens.refreshToken });
        return newTokens;
    }
}
