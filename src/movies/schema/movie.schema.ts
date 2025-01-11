import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Genre } from '../../common/types/genre.type';
import { GenreEnum } from '../../common/constants/genre';

export type MovieDocument = HydratedDocument<Movie>;

@Schema({ timestamps: true, _id: true })
export class Movie {
    @Prop({ type: Number, required: true, unique: true })
    movieId: number;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    language: string;

    @Prop({ type: String, required: true, enum: Object.values(GenreEnum) })
    genres: Genre[];

    @Prop({ type: Date, required: true })
    releaseDate: Date;

    @Prop({ type: String, required: true })
    director: string;

    @Prop({ type: [String], required: true })
    cast: string[];

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    averageRating?: number;

    @Prop({ type: Number, default: 0 })
    reviewCount?: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);
