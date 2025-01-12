import { Injectable } from '@nestjs/common';
import { MoviesService } from 'src/movies/service/movies.service';
import { ReviewService } from 'src/movies/service/review.service';

@Injectable()
export class AnalyticsService {
    constructor(
        private movieService: MoviesService,
        private reviewService: ReviewService
    ) {}

    async getTopRatedMovies() {
        return this.movieService.getTopRatedMovies();
    }

    async getMostRatedMovies() {
        return this.reviewService.getMostRatedMovies();
    }
}
