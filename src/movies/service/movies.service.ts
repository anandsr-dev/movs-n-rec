import { Injectable } from '@nestjs/common';
import { ApiService } from 'src/shared/service/api.service';
import { TMDB_BASE_URL, TMDB_SEARCH_MOVIE_PATH, TMDB_SEARCH_QUERY_PARAMS, INCLUDE_ADULT_VALUE_TRUE, TMDB_API_KEY_ENV_NAME, API_KEY_PARAM, TMDB_MOVIE_API_PATH, TMDB_MOVIE_CREDITS_PATH, TMDB_DEFAULT_LANGUAGE_QUERY, DIRECTING_DEPARTMENT } from '../constants/tmdb';
import { ConfigService } from '@nestjs/config';
import { TmdbSearchParamsDto } from '../dto/tmdb.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Movie, MovieDocument } from '../schema/movie.schema';
import { Model, UpdateQuery } from 'mongoose';
import { TMDB_Movie, TMDB_MovieCredits } from '../types/tmdb.type';
import { PAGINATION_CONFIG } from '../constants/api';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MoviesService {
    constructor(
        private readonly apiService: ApiService,
        private readonly configService: ConfigService,
        private readonly elasticsearchService: ElasticsearchService,
        private readonly eventEmitter: EventEmitter2,
        @InjectModel(Movie.name) private readonly movieModel: Model<MovieDocument>
    ) { }

    private API_KEY = this.configService.get(TMDB_API_KEY_ENV_NAME);

    private getTmdbSearchURL(tmdbSearchParamsDto: TmdbSearchParamsDto) {
        let searchUrl = `${TMDB_BASE_URL}/${TMDB_SEARCH_MOVIE_PATH}?${TMDB_SEARCH_QUERY_PARAMS.QUERY}=${tmdbSearchParamsDto.query}&${TMDB_SEARCH_QUERY_PARAMS.INCLUDE_ADULT}=${INCLUDE_ADULT_VALUE_TRUE}`;
        if (tmdbSearchParamsDto.year) {
            searchUrl += `&${TMDB_SEARCH_QUERY_PARAMS.YEAR}=${tmdbSearchParamsDto.year}`;
        }
        if (tmdbSearchParamsDto.page) {
            searchUrl += `&${TMDB_SEARCH_QUERY_PARAMS.PAGE}=${tmdbSearchParamsDto}`;
        } else {
            searchUrl += `&${TMDB_SEARCH_QUERY_PARAMS.PAGE}=1`;
        }
        return `${searchUrl}&${API_KEY_PARAM}=${this.API_KEY}&${TMDB_DEFAULT_LANGUAGE_QUERY}`;
    }

    private getTmdbMovieDetailsURL(tmdbMovieId: string) {
        return `${TMDB_BASE_URL}/${TMDB_MOVIE_API_PATH}/${tmdbMovieId}?${API_KEY_PARAM}=${this.API_KEY}&${TMDB_DEFAULT_LANGUAGE_QUERY}`;
    }

    private getTmdbMovieCreditsURL(tmdbMovieId: string) {
        return `${TMDB_BASE_URL}/${TMDB_MOVIE_API_PATH}/${tmdbMovieId}/${TMDB_MOVIE_CREDITS_PATH}?${API_KEY_PARAM}=${this.API_KEY}&${TMDB_DEFAULT_LANGUAGE_QUERY}`;
    }

    private emitMovieAddedEvent(movie) {
      this.eventEmitter.emit(
        'movie.added',
        {
          title: movie.title,
          genres: movie.genres
        }
      );
    }

    async searchTMDB(searchParams: TmdbSearchParamsDto) {
        let url = this.getTmdbSearchURL(searchParams);
        return await this.apiService.fetch(url);
    }

    // Adds movie from TMDB
    async addMovieFromTmdb(tmdbMovieId: string) {
        try {
            let url = this.getTmdbMovieDetailsURL(tmdbMovieId);
            const tmdbMovie = await this.apiService.fetch<TMDB_Movie>(url);
            const tmdbMovieCredits = await this.apiService.fetch<TMDB_MovieCredits>(this.getTmdbMovieCreditsURL(tmdbMovieId));
            const cast = tmdbMovieCredits.cast.map((member) => member.original_name);
            const director = tmdbMovieCredits.crew.find((member) => member.department === DIRECTING_DEPARTMENT).original_name;
            const movie: Movie = {
                movieId: tmdbMovie.id,
                title: tmdbMovie.title,
                language: tmdbMovie.original_language,
                genres: tmdbMovie.genres.map((genre) => genre.name),
                releaseDate: new Date(tmdbMovie.release_date),
                director,
                cast,
                description: tmdbMovie.overview
            };
            const movieDoc = await this.movieModel.create(movie);
            await this.indexMovieInElasticsearch(movieDoc);
            this.emitMovieAddedEvent({ title: movie.title, genres: movie.genres });
            return movieDoc;
        } catch (error) {
            throw error;
        }
    }

    async listMoviesPaginated(page: number = 1) {
        const limit = PAGINATION_CONFIG.LIMIT
        const skip = (page - 1) * limit;
        const movies = await this.movieModel.find()
        .skip(skip)
        .limit(limit)
        const total = await this.movieModel.countDocuments();
        return {
            movies,
            total,
            currentPage: page,
            totalPages: Math.ceil(total/limit)
        }
    }

    async findById(movieId: string) {
        return this.movieModel.findById(movieId);
    }

    async updateMovie(movieId: string, updateQuery: UpdateQuery<Movie>) {
        const movie = await this.movieModel.findOneAndUpdate({ _id: movieId }, updateQuery, { new: true });
        await this.updateMovieInElasticsearch(movie);
    }

    async deleteMovie(movieId: string) {
        await this.movieModel.deleteOne({ _id: movieId });
        await this.removeMovieFromElasticsearch(movieId);
    }

    async indexMovieInElasticsearch(movie: MovieDocument): Promise<void> {
        await this.elasticsearchService.index({
          index: 'movies',
          id: movie._id.toString(),
          body: {
            title: movie.title,
            description: movie.description,
            director: movie.director,
            genres: movie.genres,
            releaseDate: movie.releaseDate,
            averageRating: movie.averageRating,
          },
        });
      }
    
      async updateMovieInElasticsearch(movie: MovieDocument): Promise<void> {
        await this.elasticsearchService.update({
          index: 'movies',
          id: movie._id.toString(),
          body: {
            doc: {
              title: movie.title,
              description: movie.description,
              director: movie.director,
              genres: movie.genres,
              releaseDate: movie.releaseDate,
              averageRating: movie.averageRating,
            },
          },
        });
      }
    
      async removeMovieFromElasticsearch(movieId: string): Promise<void> {
        await this.elasticsearchService.delete({
          index: 'movies',
          id: movieId,
        });
      }
    
      // Recommendations helper methods
      //Get movies by genres
      async getMoviesByGenres(genres: string[], limit: number = 10, skip: number = 0): Promise<any[]> {
        return this.movieModel.find({
            genres: { $in: genres },
            averageRating: { $gte: 3 }
        })
        .skip(skip).limit(limit).exec();
      }

      //Analytics
      async getTopRatedMovies(minRating = 3, limit = 10) {
        return this.movieModel.aggregate([
          {
            $match: { averageRating: { $gte: minRating } }
          },
          {
            $sort: { averageRating: -1 }
          },
          {
            $limit: limit,
          },
          {
            $project: { title: 1, averageRating: 1, description: 1, _id: 0 }
          },
        ]);
      }
}