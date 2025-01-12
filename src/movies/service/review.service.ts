import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from '../schema/review.schema';
import { Model } from 'mongoose';
import { UserService } from 'src/identity/services/user.service';
import { PAGINATION_CONFIG } from '../constants/api';
import { AddReviewDto } from '../dto/review.dto';
import { MoviesService } from './movies.service';

@Injectable()
export class ReviewService {
    constructor(
        @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
        private userService: UserService,
        private movieService: MoviesService
    ) { }

    // Add review for a movie
    async addReview(addReviewDto: AddReviewDto) {
        const reviewDoc = await this.reviewModel.create(addReviewDto);
        await this.userService.updateUser(addReviewDto.userId, {
            $addToSet: {
                reviews: reviewDoc._id
            }
        });
        const movie = await this.movieService.findById(addReviewDto.movieId);
        const updatedRating =
            (movie.averageRating * movie.reviewCount + addReviewDto.rating) / (movie.reviewCount + 1);
        await this.movieService.updateMovie(
            addReviewDto.movieId,
            {
                averageRating: updatedRating,
                reviewCount: movie.reviewCount + 1
            }
        );
        return reviewDoc;
    }

    // Get all reviews of a movie
    async getAllReviews(movieId: string, page: number = 1) {
        const limit = PAGINATION_CONFIG.LIMIT;
        const skip = (page - 1) * limit;
        const reviews = await this.reviewModel.find({ movieId })
            .skip(skip)
            .limit(limit)
            .populate('userId')
            .populate('movieId')
        const totalCount = await this.reviewModel.countDocuments({ movieId });
        return {
            reviews,
            currentPage: page,
            totalPages: Math.ceil(totalCount/limit),
        }
    }

    async getMoviesFromUserReviews(userIds: any[]) {
        const reviews = await this.reviewModel.find({
            userId: {
                $in: userIds
            },
            rating: {
                $gte: 3
            }
        }).populate('movieId').exec()
        return reviews.map((review) => review.movieId)
      }
}
