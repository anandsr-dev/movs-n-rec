import { Module } from '@nestjs/common';
import { MoviesService } from './service/movies.service';
import { MoviesController } from './controller/movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schema/movie.schema';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema }
    ]),
    SharedModule
  ],
  providers: [MoviesService],
  controllers: [MoviesController]
})
export class MoviesModule { }
