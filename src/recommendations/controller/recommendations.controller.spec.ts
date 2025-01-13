import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationService } from '../service/recommendations.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/helpers/api-response';
import { INVALID_TOKEN } from 'src/common/constants/general';
import { RECOMMENDATIONS_API_RESPONSES } from '../constants/api';
import { ConfigService } from '@nestjs/config';  // Import ConfigService
import { JwtService } from '@nestjs/jwt';  // Import JwtService

describe('RecommendationsController', () => {
  let controller: RecommendationsController;
  let recommendationService: RecommendationService;

  // Mocking the recommendation service
  const mockRecommendationService = {
    getRecommendations: jest.fn(),
  };

  // Mocking ConfigService
  const mockConfigService = {
    get: jest.fn().mockReturnValue('some-config-value'), // Mocking a return value
  };

  // Mocking JwtService
  const mockJwtService = {
    verify: jest.fn(), // Mocking JwtService's verify method
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationsController],
      providers: [
        { provide: RecommendationService, useValue: mockRecommendationService },
        { provide: ConfigService, useValue: mockConfigService },  // Mock ConfigService
        { provide: JwtService, useValue: mockJwtService },  // Mock JwtService
        AuthGuard, // AuthGuard is automatically injected by NestJS, so it doesn't need to be mocked
      ],
    }).compile();

    controller = module.get<RecommendationsController>(RecommendationsController);
    recommendationService = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendations', () => {
    it('should return recommendations when valid user', async () => {
      const mockUser = { userId: 'user123' };
      const mockRecommendations = [{ movieId: 'movie1' }, { movieId: 'movie2' }];
      const req = { user: mockUser };
      
      // Mocking the service to return mock recommendations
      mockRecommendationService.getRecommendations.mockResolvedValue(mockRecommendations);

      const result = await controller.getRecommendations(req);

      expect(result).toEqual(ApiResponse.success(RECOMMENDATIONS_API_RESPONSES.SUCCESS, mockRecommendations));
      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledWith('user123');
      expect(mockRecommendationService.getRecommendations).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if user is not in the request', async () => {
      const req = { user: null };  // No user in request

      await expect(controller.getRecommendations(req)).rejects.toThrowError(INVALID_TOKEN);
    });

    it('should return error if recommendation service fails', async () => {
      const mockUser = { userId: 'user123' };
      const req = { user: mockUser };

      // Simulating failure in the service
      mockRecommendationService.getRecommendations.mockRejectedValue(new Error('Service failed'));

      await expect(controller.getRecommendations(req)).rejects.toThrowError('Service failed');
    });
  });
});
