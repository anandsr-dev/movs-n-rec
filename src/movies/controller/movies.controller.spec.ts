import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from '../service/movies.service';
import { ReviewService } from '../service/review.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ApiResponse } from 'src/common/helpers/api-response';
import { AddMovieDto, UpdateMovieDto } from '../dto/movie.dto';
import { AddReviewBody } from '../dto/review.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request } from 'express';

describe('MoviesController', () => {
  let controller: MoviesController;
  let movieService: MoviesService;
  let reviewService: ReviewService;
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  // Mock movie and review data
  const mockMovie = {
    _id: '1',
    title: 'Movie Title',
    tmdbId: '123',
  };

  const mockReview = {
    _id: '1',
    movieId: '1',
    userId: 'user1',
    content: 'Great Movie!',
  };

  const mockAddMovieDto: AddMovieDto = {
    movieId: '123',
  };

  const mockUpdateMovieDto: UpdateMovieDto = {
    title: 'Updated Movie Title',
  };

  const mockAddReviewBody: AddReviewBody = {
    rating: 4,
    comment: 'Amazing movie!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret', // Provide a test secret for JwtService
          signOptions: { expiresIn: '60s' }, // Set expiration (optional)
        }),
      ],
      controllers: [MoviesController],
      providers: [
        MoviesService,
        ReviewService,
        JwtService,
        ConfigService,
        {
          provide: MoviesService,
          useValue: {
            searchTMDB: jest.fn().mockResolvedValue(mockMovie),
            addMovieFromTmdb: jest.fn().mockResolvedValue(mockMovie),
            listMoviesPaginated: jest.fn().mockResolvedValue([mockMovie]),
            updateMovie: jest.fn().mockResolvedValue(mockMovie),
            deleteMovie: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: ReviewService,
          useValue: {
            addReview: jest.fn().mockResolvedValue(mockReview),
            getAllReviews: jest.fn().mockResolvedValue([mockReview]),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: RoleGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieService = module.get<MoviesService>(MoviesService);
    reviewService = module.get<ReviewService>(ReviewService);
    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService); // Get JwtService instance if needed
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /tmdb/search', () => {
    it('should return the movie from TMDB search', async () => {
      const response = await controller.searchTmdb({ query: 'terminator' });
      expect(response).toEqual(ApiResponse.success('Movies fetched successfully', mockMovie));
    });
  });

  describe('POST /', () => {
    it('should add a movie', async () => {
      const response = await controller.addMovie(mockAddMovieDto);
      expect(response).toEqual(ApiResponse.success('Movie added from TMDB successfully', mockMovie));
    });

    it('should handle error if adding movie fails', async () => {
      const error = new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
      jest.spyOn(movieService, 'addMovieFromTmdb').mockRejectedValue(error);

      try {
        await controller.addMovie(mockAddMovieDto);
      } catch (e) {
        expect(e.response).toBe('Something went wrong');
        expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('GET /', () => {
    it('should return a paginated list of movies', async () => {
      const response = await controller.listMovies(1);
      expect(response).toEqual(ApiResponse.success('Movies fetched successfully', [mockMovie]));
    });
  });

  describe('PUT /:id', () => {
    it('should update a movie', async () => {
      const response = await controller.updateMovie('1', mockUpdateMovieDto);
      expect(response).toEqual(ApiResponse.success('Movie updated successfully', null));
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a movie', async () => {
      const response = await controller.deleteMovie('1');
      expect(response).toEqual(ApiResponse.success('Movie deleted successfully', null));
    });
  });

  describe('POST /:id/reviews', () => {
    it('should add a review', async () => {
      const mockRequest = { 
        user: { userId: 'user1' }, 
        params: { id: '1' }, 
      } as any;
      
      const response = await controller.addReview(mockAddReviewBody, mockRequest);
      expect(response).toEqual(ApiResponse.success('Review added successfully', mockReview));
    });
  });

  describe('GET /:id/reviews', () => {
    it('should return all reviews for a movie', async () => {
      const response = await controller.getAllReviews('0ijhuozhjjk', 1);
      expect(response).toEqual(ApiResponse.success('Reviews fetched successfully', [mockReview]));
    });
  });
});
