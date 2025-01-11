export class AddReviewBody {
    rating: number;
    comment?: string;
}

export class AddReviewDto {
    userId: string;
    movieId: string;
    rating: number;
    comment?: string;
}