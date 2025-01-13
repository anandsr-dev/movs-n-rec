import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from '../service/search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  // Mock response data
  const mockSearchResponse = [
    {
      movieId: '1',
      title: 'Test Movie 1',
      genres: ['Action', 'Comedy'],
      releaseYear: 2023,
      rating: 4.5,
    },
    {
      movieId: '2',
      title: 'Test Movie 2',
      genres: ['Drama'],
      releaseYear: 2022,
      rating: 4.0,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: {
            searchMovies: jest.fn().mockResolvedValue(mockSearchResponse), // Mock the searchMovies function
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /movies/search', () => {
    it('should call searchService.searchMovies and return movies for given query', async () => {
      const query = 'Test';
      const result = await controller.searchMovies(query);

      expect(searchService.searchMovies).toHaveBeenCalledWith('Test', {}, 1, 10);
      expect(result).toEqual(mockSearchResponse);
    });

    it('should include filters for genres when provided', async () => {
      const query = 'Test';
      const genres = 'Action,Comedy';
      const result = await controller.searchMovies(query, genres);

      const filters = { genres: 'Action,Comedy' };
      expect(searchService.searchMovies).toHaveBeenCalledWith(query, filters, 1, 10);
      expect(result).toEqual(mockSearchResponse);
    });

    it('should include filters for releaseYear when provided', async () => {
      const query = 'Test';
      const releaseYear = 2023;
      const result = await controller.searchMovies(query, undefined, releaseYear);

      const filters = { releaseYear: 2023 };
      expect(searchService.searchMovies).toHaveBeenCalledWith(query, filters, 1, 10);
      expect(result).toEqual(mockSearchResponse);
    });

    it('should include filters for rating when provided', async () => {
      const query = 'Test';
      const rating = 'gte:4,lte:5';
      const result = await controller.searchMovies(query, undefined, undefined, rating);

      const filters = { rating: { gte: 4, lte: 5 } };
      expect(searchService.searchMovies).toHaveBeenCalledWith(query, filters, 1, 10);
      expect(result).toEqual(mockSearchResponse);
    });

    it('should handle pagination and limit parameters', async () => {
      const query = 'Test';
      const page = 2;
      const limit = 5;
      const result = await controller.searchMovies(query, undefined, undefined, undefined, page, limit);

      expect(searchService.searchMovies).toHaveBeenCalledWith(query, {}, 2, 5);
      expect(result).toEqual(mockSearchResponse);
    });

    it('should handle default pagination when page and limit are not provided', async () => {
      const query = 'Test';
      const result = await controller.searchMovies(query);

      expect(searchService.searchMovies).toHaveBeenCalledWith(query, {}, 1, 10);
      expect(result).toEqual(mockSearchResponse);
    });
  });
});
