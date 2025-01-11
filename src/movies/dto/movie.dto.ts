export class AddMovieDto {
    movieId: string
}

export class UpdateMovieDto {
    title?: string;
    language?: string;
    genres?: string[];
    releaseDate?: Date;
    director?: string;
    cast?: string[];
    description?: string;
}