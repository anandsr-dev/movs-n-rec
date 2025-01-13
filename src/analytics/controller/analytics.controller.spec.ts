import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../service/analytics.service';
import { ApiResponse } from 'src/common/helpers/api-response';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    // Create a testing module and mock the AnalyticsService
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            getTopRatedMovies: jest.fn(),
            getMostRatedMovies: jest.fn(), 
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();  // Check if the controller is defined
  });

  describe('getTopRated', () => {
    it('should return top rated movies successfully', async () => {
      const mockTopRatedMovies = [{ title: 'Movie 1', rating: 4.5, description: 'Movie 1 description' }, { title: 'Movie 2', rating: 4.8, description: 'Movie 1 description' }];
      
      // Mock the service call to return mock data
      jest.spyOn(service, 'getTopRatedMovies').mockResolvedValue(mockTopRatedMovies);

      const result = await controller.getTopRated();

      expect(result).toEqual(ApiResponse.success('Fetched top rated movies successfully', mockTopRatedMovies)); // Check if the correct response is returned
      expect(service.getTopRatedMovies).toHaveBeenCalled();  // Check if the service method was called
    });
  });

  describe('getMostReviewed', () => {
    it('should return most reviewed movies successfully', async () => {
      const mockMostReviewedMovies = [{ title: 'Movie 3', reviews: 150, description: 'Movie 1 description' }, { title: 'Movie 4', reviews: 200, description: 'Movie 2 description' }];
      
      // Mock the service call to return mock data
      jest.spyOn(service, 'getMostRatedMovies').mockResolvedValue(mockMostReviewedMovies);

      const result = await controller.getMostReviewed();

      expect(result).toEqual(ApiResponse.success('Fetched most reviewed movies successfully', mockMostReviewedMovies)); // Check if the correct response is returned
      expect(service.getMostRatedMovies).toHaveBeenCalled();  // Check if the service method was called
    });
  });
});