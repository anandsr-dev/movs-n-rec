import { Module } from '@nestjs/common';
import { MoviesService } from './service/movies.service';
import { MoviesController } from './controller/movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schema/movie.schema';
import { SharedModule } from 'src/shared/shared.module';
import { Review, ReviewSchema } from './schema/review.schema';
import { IdentityModule } from 'src/identity/identity.module';
import { ReviewService } from './service/review.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Review.name, schema: ReviewSchema }
    ]),
    SharedModule,
    IdentityModule
  ],
  providers: [MoviesService, ReviewService],
  controllers: [MoviesController]
})
export class MoviesModule { }
