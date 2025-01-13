import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { ApiService } from 'src/shared/service/api.service';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Movie, MovieDocument } from '../schema/movie.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('MoviesService', () => {
  let service: MoviesService;
  let apiService: ApiService;
  let elasticsearchService: ElasticsearchService;
  let movieModel: Model<MovieDocument>;

  const mockApiService = {
    fetch: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('fake-api-key'),
  };

  const mockElasticsearchService = {
    index: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockMovieModel = {
    create: jest.fn(),
    find: <any>jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
  } as any;

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: ApiService, useValue: mockApiService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ElasticsearchService, useValue: mockElasticsearchService },
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    apiService = module.get<ApiService>(ApiService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
    movieModel = module.get<Model<MovieDocument>>(getModelToken(Movie.name));
    await module.init();
  });

  describe('searchTMDB', () => {
    it('should call apiService.fetch with correct URL', async () => {
      const mockResponse = { results: [{ title: 'Test Movie' }] };
      mockApiService.fetch.mockResolvedValue(mockResponse);

      const searchParams = { query: 'Test', year: '2023', page: '1' };
      const result = await service.searchTMDB(searchParams);

      expect(mockApiService.fetch).toHaveBeenCalledWith(expect.stringContaining('Test'));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addMovieFromTmdb', () => {
    it('should add a movie from TMDB and index in Elasticsearch', async () => {
      const tmdbMovieId = '123';
      const mockTmdbMovie = { id: 123, title: 'Test Movie', original_language: 'en', genres: [{ name: 'Action' }], release_date: '2023-01-01', overview: 'Test description' };
      const mockTmdbCredits = { cast: [{ original_name: 'Actor 1' }], crew: [{ department: 'Directing', original_name: 'Director' }] };

      mockApiService.fetch
        .mockResolvedValueOnce(mockTmdbMovie)
        .mockResolvedValueOnce(mockTmdbCredits);
      // Ensure the unrelated `/search/movie` call is not executed
      jest.spyOn(service, 'searchTMDB').mockResolvedValue([]); // Mock searchTMDB to isolate the test
      mockMovieModel.create.mockResolvedValue({ ...mockTmdbMovie, _id: 'movie-id' });

      const result = await service.addMovieFromTmdb(tmdbMovieId);
      expect(mockMovieModel.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Movie',
        director: 'Director',
        cast: ['Actor 1'],
      }));
      const mockElasticIndexPayload = { index: 'movies', id: 'movie-id', body: { title: 'Test Movie', genres: [{ name: "Action" }]}}
      expect(mockElasticsearchService.index).toHaveBeenCalledWith(expect.objectContaining(mockElasticIndexPayload));
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('movie.added', { title: 'Test Movie', genres: ['Action'] });
      expect(result.title).toBe('Test Movie');
    });

    it('should throw an error if fetching movie details fails', async () => {
      mockApiService.fetch.mockRejectedValue(new Error('TMDB fetch failed'));

      await expect(service.addMovieFromTmdb('123')).rejects.toThrowError('TMDB fetch failed');
    });
  });

  describe('listMoviesPaginated', () => {
    it('should return paginated movies list', async () => {
      const mockMovies = [
        { title: 'Movie 1', genres: ['Action'] },
        { title: 'Movie 2', genres: ['Drama'] },
      ];
      const mockTotal = 20;
      const page = 1;
      const limit = 50;

      // Mocking the `find` method to return a chainable query object
      mockMovieModel.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockMovies),
        }),
      });

      // Mocking the `countDocuments` method
      mockMovieModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.listMoviesPaginated(page);

      expect(mockMovieModel.find).toHaveBeenCalledTimes(1);
      expect(mockMovieModel.find).toHaveBeenCalledWith();
      expect(mockMovieModel.countDocuments).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        movies: mockMovies,
        total: mockTotal,
        currentPage: page,
        totalPages: Math.ceil(mockTotal / limit),
      });
    });
  });

  describe('findById', () => {
    it('should return movie by ID', async () => {
      const mockMovie = { title: 'Test Movie' };
      mockMovieModel.findById.mockResolvedValue(mockMovie);

      const result = await service.findById('movie-id');

      expect(mockMovieModel.findById).toHaveBeenCalledWith('movie-id');
      expect(result).toEqual(mockMovie);
    });
  });

  describe('updateMovie', () => {
    it('should update a movie and update it in Elasticsearch', async () => {
      const mockUpdatedMovie = { title: 'Updated Movie', _id: 'movie-id' };
      mockMovieModel.findOneAndUpdate.mockResolvedValue(mockUpdatedMovie);

      await service.updateMovie('movie-id', { title: 'Updated Movie' });

      expect(mockMovieModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'movie-id' },
        { title: 'Updated Movie' },
        { new: true }
      );
      expect(mockElasticsearchService.update).toHaveBeenCalled();
    });
  });

  describe('deleteMovie', () => {
    it('should delete a movie and remove it from Elasticsearch', async () => {
      mockMovieModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.deleteMovie('movie-id');

      expect(mockMovieModel.deleteOne).toHaveBeenCalledWith({ _id: 'movie-id' });
      expect(mockElasticsearchService.delete).toHaveBeenCalledWith({
        index: 'movies',
        id: 'movie-id',
      });
    });
  });
});
