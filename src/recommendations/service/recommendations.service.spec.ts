import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendations.service';
import { UserService } from 'src/identity/services/user.service';
import { MoviesService } from 'src/movies/service/movies.service';
import { ReviewService } from 'src/movies/service/review.service';
import { UserInfo } from 'src/identity/types/user.type';

describe('RecommendationService', () => {
  let recommendationService;
  let mockUserService;
  let mockMoviesService;
  let mockReviewService;

  // Mock user data
  const mockUser: any = {
    userId: 'user123',
    favoriteGenres: ['Action', 'Comedy'],
    // Other user info...
  };

  // Mock movie data
  const mockMoviesByGenres = [
    { title: 'Action Movie 1' },
    { title: 'Comedy Movie 1' },
  ];

  const mockMoviesFromReviews = [
    { title: 'Drama Movie 1' },
    { title: 'Action Movie 2' },
  ];

  // Creating mocks for the services
  beforeEach(async () => {
    mockUserService = {
      getUserInfo: jest.fn().mockResolvedValue(mockUser),
      findUsersWithSimilarTaste: jest.fn().mockResolvedValue([mockUser]),
    } as any;

    mockMoviesService = {
      getMoviesByGenres: jest.fn().mockResolvedValue(mockMoviesByGenres),
    } as any;

    mockReviewService = {
      getMoviesFromUserReviews: jest.fn().mockResolvedValue(mockMoviesFromReviews),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationService,
        { provide: UserService, useValue: mockUserService },
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: ReviewService, useValue: mockReviewService },
      ],
    }).compile();

    recommendationService = module.get<RecommendationService>(RecommendationService);
  });

  it('should be defined', () => {
    expect(recommendationService).toBeDefined();
  });

  describe('recommendByGenres', () => {
    it('should return movies based on user favorite genres', async () => {
      const result = await recommendationService['recommendByGenres'](mockUser);
      expect(result).toEqual(mockMoviesByGenres);
      expect(mockMoviesService.getMoviesByGenres).toHaveBeenCalledWith(mockUser.favoriteGenres);
      expect(mockMoviesService.getMoviesByGenres).toHaveBeenCalledTimes(1);
    });
  });

  describe('recommendBySimilarUsers', () => {
    it('should return movies based on similar users preferences', async () => {
      const result = await recommendationService['recommendBySimilarUsers'](mockUser);
      expect(result).toEqual(mockMoviesFromReviews);
      expect(mockUserService.findUsersWithSimilarTaste).toHaveBeenCalledWith(mockUser);
      expect(mockUserService.findUsersWithSimilarTaste).toHaveBeenCalledTimes(1);
      expect(mockReviewService.getMoviesFromUserReviews).toHaveBeenCalledWith([mockUser._id]);
      expect(mockReviewService.getMoviesFromUserReviews).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRecommendations', () => {
    it('should return combined movie recommendations', async () => {
      const result = await recommendationService.getRecommendations(mockUser._id);
      expect(result).toEqual({
        byGenres: mockMoviesByGenres,
        bySimilarUsers: mockMoviesFromReviews,
      });
      expect(mockUserService.getUserInfo).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockUserService.getUserInfo).toHaveBeenCalledTimes(1);
      expect(mockMoviesService.getMoviesByGenres).toHaveBeenCalledWith(mockUser.favoriteGenres);
      expect(mockMoviesService.getMoviesByGenres).toHaveBeenCalledTimes(1);
      expect(mockReviewService.getMoviesFromUserReviews).toHaveBeenCalledWith([mockUser._id]);
      expect(mockReviewService.getMoviesFromUserReviews).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully when fetching recommendations', async () => {
      // Simulate a failure in getRecommendations
      mockMoviesService.getMoviesByGenres.mockRejectedValue(new Error('Movies Service Error'));
      await expect(recommendationService.getRecommendations(mockUser.userId)).rejects.toThrow('Movies Service Error');
    });
  });
});
