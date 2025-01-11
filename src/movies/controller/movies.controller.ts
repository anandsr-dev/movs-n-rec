import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { MoviesService } from '../service/movies.service';
import { AddMovieDto, UpdateMovieDto } from '../dto/movie.dto';
import { TmdbSearchParamsDto } from '../dto/tmdb.dto';
import { ApiResponse } from 'src/common/helpers/api-response';
import { ADD_MOVIE_FROM_TMDB_RESPONSES, ADD_REVIEW_RESPONSES, DELETE_MOVIE_RESPONSES, GET_ALL_REVIEWS_RESPONSES, LIST_MOVIES_RESPONSE, SEARCH_TMDB_RESPONSE_MESSAGES, UPDATE_MOVIE_RESPONSES } from '../constants/api';
import { ApiCreatedResponse, ApiInternalServerErrorResponse, ApiOkResponse } from '@nestjs/swagger';
import { API_FAILURE_ERROR } from 'src/shared/constants/api';
import { CustomError } from 'src/common/helpers/custom.error';
import { SOMETHING_WENT_WRONG } from 'src/common/constants/general';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ReviewService } from '../service/review.service';
import { AddReviewBody } from '../dto/review.dto';
import { Request } from 'express';

@Controller('movies')
export class MoviesController {
    constructor(
        private movieService: MoviesService,
        private reviewService: ReviewService
    ) { }

    //Movie controllers

    // Api to get tmdb movie id for the required movie
    @Get('/tmdb/search')
    @ApiOkResponse({ description: SEARCH_TMDB_RESPONSE_MESSAGES.SUCCESS })
    async searchTmdb(@Query() tmdbSearchParams: TmdbSearchParamsDto) {
        const response = await this.movieService.searchTMDB(tmdbSearchParams);
        return ApiResponse.success(SEARCH_TMDB_RESPONSE_MESSAGES.SUCCESS, response);
    }

    // Adds movie using tmdb movie id
    @Post()
    @ApiCreatedResponse({ description: ADD_MOVIE_FROM_TMDB_RESPONSES.SUCCESS })
    @ApiInternalServerErrorResponse({ description: API_FAILURE_ERROR })
    async addMovie(@Body() addMovieDto: AddMovieDto) {
        try {
            const movie = await this.movieService.addMovieFromTmdb(addMovieDto.movieId);
            return ApiResponse.success(ADD_MOVIE_FROM_TMDB_RESPONSES.SUCCESS, movie);
        } catch (error) {
            console.log(error);
            const errMessage = error instanceof CustomError ? error.message : SOMETHING_WENT_WRONG;
            throw new HttpException(errMessage, HttpStatus.INTERNAL_SERVER_ERROR, { cause: error.name });
        }
    }

    @ApiOkResponse({ description: LIST_MOVIES_RESPONSE.SUCCESS })
    @Get()
    async listMovies(@Query('page') page?: number) {
        const res = await this.movieService.listMoviesPaginated(page);
        return ApiResponse.success(LIST_MOVIES_RESPONSE.SUCCESS, res);
    }

    @ApiOkResponse({ description: UPDATE_MOVIE_RESPONSES.SUCCESS })
    @UseGuards(
        AuthGuard,
        RoleGuard('admin')
    )
    @Put('/:id')
    async updateMovie(@Param('id') movieId: string, @Body() updateMovieDto: UpdateMovieDto) {
        await this.movieService.updateMovie(movieId, updateMovieDto);
        return ApiResponse.success(UPDATE_MOVIE_RESPONSES.SUCCESS, null);
    }

    @ApiOkResponse({ description: DELETE_MOVIE_RESPONSES.SUCCESS })
    @UseGuards(
        AuthGuard,
        RoleGuard('admin')
    )
    @Delete('/:id')
    async deleteMovie(@Param('id') movieId: string) {
        await this.movieService.deleteMovie(movieId);
        return ApiResponse.success(DELETE_MOVIE_RESPONSES.SUCCESS, null);
    }


    //Movie review controllers

    // Add review
    @ApiOkResponse({ description: ADD_REVIEW_RESPONSES.SUCCESS })
    @UseGuards(AuthGuard)
    @Post('/:id/reviews')
    async addReview(@Body() addReviewBody: AddReviewBody, @Req() req: Request) {
        const addReviewDto = { ...addReviewBody, userId: req['user']?.userId, movieId: req.params.id };
        const addedReview = await this.reviewService.addReview(addReviewDto);
        return ApiResponse.success(ADD_REVIEW_RESPONSES.SUCCESS, addedReview);
    }

    // Fetch all reviews of a movie
    @ApiOkResponse({ description: GET_ALL_REVIEWS_RESPONSES.SUCCESS })
    @UseGuards(AuthGuard)
    @Get('/:id/reviews')
    async getAllReviews(@Param('id') movieId: string, @Query('page') page: number) {
        const res = await this.reviewService.getAllReviews(movieId, page);
        return ApiResponse.success(GET_ALL_REVIEWS_RESPONSES.SUCCESS, res);
    }
}
