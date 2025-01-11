import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { MoviesService } from '../service/movies.service';
import { AddMovieDto } from '../dto/movie.dto';
import { TmdbSearchParamsDto } from '../dto/tmdb.dto';
import { ApiResponse } from 'src/common/helpers/api-response';
import { ADD_MOVIE_FROM_TMDB_RESPONSES, SEARCH_TMDB_RESPONSE_MESSAGES } from '../constants/api';

@Controller('movies')
export class MoviesController {
    constructor(private movieService: MoviesService) { }

    @Get('/tmdb/search')
    async searchTmdb(@Query() tmdbSearchParams: TmdbSearchParamsDto) {
        const response = await this.movieService.searchTMDB(tmdbSearchParams);
        return ApiResponse.success(SEARCH_TMDB_RESPONSE_MESSAGES.SUCCESS, response);
    }

    @Post()
    async addMovie(@Body() addMovieDto: AddMovieDto) {
        try {
            const movie = await this.movieService.addMovieFromTmdb(addMovieDto.movieId);
            return ApiResponse.success(ADD_MOVIE_FROM_TMDB_RESPONSES.SUCCESS, movie);
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: error.name });
        }
    }
}
