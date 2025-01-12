import { Injectable } from '@nestjs/common';
import { UserService } from 'src/identity/services/user.service';
import { UserInfo } from 'src/identity/types/user.type';
import { MoviesService } from 'src/movies/service/movies.service';
import { ReviewService } from 'src/movies/service/review.service';

@Injectable()
export class RecommendationService {
    constructor(
        private readonly userService: UserService,
        private readonly moviesService: MoviesService,
        private readonly reviewService: ReviewService,
    ) { }

    // Get recommended movies based on user's favorite genres
    private async recommendByGenres(user: UserInfo): Promise<any[]> {
        return this.moviesService.getMoviesByGenres(user.favoriteGenres);
    }

    // Get recommended movies based on ratings & reviews of similar users
    private async recommendBySimilarUsers(user: UserInfo): Promise<any[]> {
        // Find users with similar preferences
        const similarUsers = await this.userService.findUsersWithSimilarTaste(user);
        const userIds = similarUsers.map(user => user._id);

        // Aggregate highly-rated movies from similar users
        const recommendedMovies = await this.reviewService.getMoviesFromUserReviews(userIds);
        return recommendedMovies;
    }

    // Aggregate recommendations
    async getRecommendations(userId: string): Promise<any> {
        const user = await this.userService.getUserInfo({ userId });
        const genreRecommendations = await this.recommendByGenres(user);
        const userRecommendations = await this.recommendBySimilarUsers(user);

        return {
            byGenres: genreRecommendations,
            bySimilarUsers: userRecommendations,
        };
    }
}
