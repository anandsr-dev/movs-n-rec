import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from 'src/common/helpers/api-response';
import { REFRESH_COOKIE_KEY } from 'src/common/constants/general';
import { getCookieConfig } from 'src/common/helpers/cookie';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refresh: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.header = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  // Mock getCookieConfig to return consistent output
  jest.mock('src/common/helpers/cookie', () => ({
    getCookieConfig: jest.fn((hours) => ({
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: expect.anything(),
    })),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should login a user and set cookies and headers', async () => {
      const mockLoginDto: LoginDto = { username: 'user123', password: 'password123' };
      const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token', exp: 12345 };
      mockAuthService.login.mockResolvedValue(mockTokens);

      const res = mockResponse();
      await authController.login(mockLoginDto, res);

      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
      expect(res.cookie).toHaveBeenCalledWith(REFRESH_COOKIE_KEY, mockTokens.refreshToken, getCookieConfig(24));
      expect(res.header).toHaveBeenCalledWith('Authorization', mockTokens.accessToken);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        ApiResponse.success('Logged in successfully', { exp: mockTokens.exp })
      );
    });
  });

  describe('logout', () => {
    it('should logout a user and clear the refresh token cookie', async () => {
      const mockRefreshToken = 'refresh-token';
      const mockRequest = { cookies: { [REFRESH_COOKIE_KEY]: mockRefreshToken } } as any;
      const res = mockResponse();

      await authController.logout(mockRequest, res);

      expect(authService.logout).toHaveBeenCalledWith(mockRefreshToken);

      expect(res.cookie).toHaveBeenCalledWith(REFRESH_COOKIE_KEY, '', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: expect.anything()
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(ApiResponse.success('Logged out successfully', null));
    });
  });

  describe('refresh', () => {
    it('should refresh tokens and set the new refresh token in cookies', async () => {
      const mockRefreshToken = 'old-refresh-token';
      const mockNewTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token', exp: 67890 };
      const mockRequest = { cookies: { [REFRESH_COOKIE_KEY]: mockRefreshToken } } as any;

      mockAuthService.refresh.mockResolvedValue(mockNewTokens);

      const res = mockResponse();
      await authController.refresh(mockRequest, res);

      expect(authService.refresh).toHaveBeenCalledWith(mockRefreshToken);
      expect(res.cookie).toHaveBeenCalledWith(REFRESH_COOKIE_KEY, mockNewTokens.refreshToken, getCookieConfig(24));
      expect(res.header).toHaveBeenCalledWith('Authorization', mockNewTokens.accessToken);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        ApiResponse.success('New tokens issued successfully', { exp: mockNewTokens.exp })
      );
    });
  });
});
