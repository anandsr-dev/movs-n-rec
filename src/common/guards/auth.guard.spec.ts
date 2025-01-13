import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { IJwtPayload } from '../types/auth.type';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    // Create a testing module and mock JwtService and ConfigService
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(), // Mocking verifyAsync method
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-private-key'), // Mocking get method for the private key
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined(); // Check if the AuthGuard is defined
  });

  describe('canActivate', () => {
    it('should allow access when token is valid', async () => {
      const mockPayload: IJwtPayload = { userId: 'user123', username: 'user123', role: 'user' }; // Example payload
      const mockRequest: any = { headers: { authorization: 'Bearer validToken' } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as any; // Mocking ExecutionContext

      // Mock JwtService to resolve with the mock payload
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const result = await authGuard.canActivate(context);
      expect(result).toBe(true); // Should return true if token is valid
      expect(mockRequest.user).toEqual(mockPayload); // Check if the payload is attached to the request
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = { headers: {} };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as any;

      try {
        await authGuard.canActivate(context);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException); // Check if UnauthorizedException is thrown
        expect(err.message).toBe('Access token is missing'); // Check the error message
      }
    });

    it('should throw UnauthorizedException if the token is invalid', async () => {
      const mockRequest = { headers: { authorization: 'Bearer invalidToken' } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as any;

      // Mock JwtService to throw an error for invalid token
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Invalid token'));

      try {
        await authGuard.canActivate(context);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException); // Check if UnauthorizedException is thrown
        expect(err.message).toBe('Invalid or expired access token'); // Check the error message
      }
    });

    it('should throw UnauthorizedException if private key is missing in config', async () => {
      const mockRequest = { headers: { authorization: 'Bearer validToken' } };
      const context = {
        switchToHttp: () => ({ getRequest: () => mockRequest }),
      } as any;

      // Mock ConfigService to return undefined for the private key
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      try {
        await authGuard.canActivate(context);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException); // Check if UnauthorizedException is thrown
        expect(err.message).toBe('Token key is not configured'); // Check the error message
      }
    });
  });
});
