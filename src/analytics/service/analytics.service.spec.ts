import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { MoviesService } from 'src/movies/service/movies.service';
import { ReviewService } from 'src/movies/service/review.service';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let moviesService: MoviesService;
  let reviewService: ReviewService;

  const mockMoviesService = {
    getTopRatedMovies: jest.fn(),
  };

  const mockReviewService = {
    getMostRatedMovies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: ReviewService, useValue: mockReviewService },
      ],
    }).compile();

    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    moviesService = module.get<MoviesService>(MoviesService);
    reviewService = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(analyticsService).toBeDefined();
  });

  describe('getTopRatedMovies', () => {
    it('should return top-rated movies', async () => {
      const mockTopRatedMovies = [
        { title: 'Movie A', averageRating: 4.5, description: 'Movie A description' },
        { title: 'Movie B', averageRating: 4.2, description: 'Movie B description' },
      ];
      mockMoviesService.getTopRatedMovies.mockResolvedValue(mockTopRatedMovies);

      const result = await analyticsService.getTopRatedMovies();
      expect(result).toEqual(mockTopRatedMovies);
      expect(moviesService.getTopRatedMovies).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMostRatedMovies', () => {
    it('should return most-rated movies', async () => {
      const mockMostRatedMovies = [
        { title: 'Movie A', numberOfRatings: 100, description: 'Movie A description' },
        { title: 'Movie B', numberOfRatings: 95, description: 'Movie B description' },
      ];
      mockReviewService.getMostRatedMovies.mockResolvedValue(mockMostRatedMovies);

      const result = await analyticsService.getMostRatedMovies();
      expect(result).toEqual(mockMostRatedMovies);
      expect(reviewService.getMostRatedMovies).toHaveBeenCalledTimes(1);
    });
  });
});
