import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../services/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { LOGIN_RESPONSE_MESSAGES, LOGOUT_RESPONSE_MESSAGES } from 'src/identity/constants/api';
import { IJwtPayload } from 'src/common/types/auth.type';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  describe('getNewTokens', () => {
    it('should generate new tokens and return them', async () => {
      const jwtPayload = { userId: '1', username: 'test', role: 'user' } as IJwtPayload;
      configService.get.mockReturnValue('secretKey');
      jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      jwtService.decode.mockReturnValue({ exp: 123456 });

      const result = await authService.getNewTokens(jwtPayload);

      expect(configService.get).toHaveBeenCalledTimes(2);
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken', exp: 123456 });
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const loginDto = { username: 'test', password: 'password' };
      const user: any = { _id: '1', username: 'test', password: 'hashedPassword', role: 'user' };
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userService.getUser.mockResolvedValue(user);
      jest.spyOn(authService, 'getNewTokens').mockResolvedValue({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        exp: 123456,
      } as any);

      const result = await authService.login(loginDto);

      expect(userService.getUser).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(authService.getNewTokens).toHaveBeenCalledWith({
        userId: '1',
        username: 'test',
        role: 'user',
      });
      expect(userService.updateUser).toHaveBeenCalledWith('1', { refreshToken: 'refreshToken' });
      expect(result).toEqual({ accessToken: 'accessToken', refreshToken: 'refreshToken', exp: 123456 });
    });

    it('should throw an exception if the user does not exist', async () => {
      userService.getUser.mockResolvedValue(null);

      await expect(authService.login({ username: 'test', password: 'password' })).rejects.toThrow(
        new HttpException(LOGIN_RESPONSE_MESSAGES.USER_NOT_EXIST, HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an exception if the password is invalid', async () => {
      const user: any = { _id: '1', username: 'test', password: 'hashedPassword', role: 'user' };
      userService.getUser.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);


      await expect(authService.login({ username: 'test', password: 'wrongPassword' })).rejects.toThrow(
        new HttpException(LOGIN_RESPONSE_MESSAGES.INVALID_PASSWORD, HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('logout', () => {
    it('should logout a user by clearing their refresh token', async () => {
      jwtService.verify.mockReturnValue({ userId: '1' });
      const refreshToken = 'validToken';

      await authService.logout(refreshToken);

      expect(jwtService.verify).toHaveBeenCalledWith(refreshToken, { secret: undefined });
      expect(userService.updateUser).toHaveBeenCalledWith('1', { refreshToken: '' });
    });

    it('should throw an exception if no refresh token is provided', async () => {
      await expect(authService.logout(null)).rejects.toThrow(
        new HttpException(LOGOUT_RESPONSE_MESSAGES.REFRESH_TOKEN_REQUIRED, HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an exception if the refresh token is invalid', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new HttpException(LOGOUT_RESPONSE_MESSAGES.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
      });

      await expect(authService.logout('invalidToken')).rejects.toThrow(
        new HttpException(LOGOUT_RESPONSE_MESSAGES.INVALID_TOKEN, HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and return new ones', async () => {
      const refreshToken = 'validRefreshToken';
      const decodedToken = { userId: '1', username: 'test', role: 'user' };
      jwtService.decode.mockReturnValue(decodedToken);
      userService.getUser.mockResolvedValue({
        _id: 'asfdad',
        username: 'test',
        refreshToken: 'validRefreshToken',
        role: 'user',
      } as any);
      jest.spyOn(authService, 'getNewTokens').mockResolvedValue({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        exp: 123456,
      } as any);

      const result = await authService.refresh(refreshToken);

      expect(jwtService.decode).toHaveBeenCalledWith(refreshToken);
      expect(userService.getUser).toHaveBeenCalledWith({ userId: '1' });
      expect(authService.getNewTokens).toHaveBeenCalledWith({
        userId: '1',
        username: 'test',
        role: 'user',
      });
      expect(userService.updateUser).toHaveBeenCalledWith('1', { refreshToken: 'newRefreshToken' });
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        exp: 123456,
      });
    });

    it('should throw an exception if the refresh token is invalid', async () => {
      const refreshToken = 'invalidToken';
      jwtService.decode.mockReturnValue(new UnauthorizedException('Invalid refresh token'));

      await expect(authService.refresh(refreshToken)).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
    });
  });
});
