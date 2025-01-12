import { Module } from '@nestjs/common';
import { MoviesService } from './service/movies.service';
import { MoviesController } from './controller/movies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Movie, MovieSchema } from './schema/movie.schema';
import { SharedModule } from 'src/shared/shared.module';
import { Review, ReviewSchema } from './schema/review.schema';
import { IdentityModule } from 'src/identity/identity.module';
import { ReviewService } from './service/review.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchController } from './controller/search.controller';
import { SearchService } from './service/search.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Movie.name, schema: MovieSchema },
      { name: Review.name, schema: ReviewSchema }
    ]),
    SharedModule,
    IdentityModule,
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME || '',
          password: process.env.ELASTICSEARCH_PASSWORD || '',
        },
        caFingerprint: process.env.ELASTICSEARCH_SSL_FINGERPRINT,
        tls: {
          rejectUnauthorized: false
        }
      }),
    }),
  ],
  providers: [MoviesService, ReviewService, SearchService],
  controllers: [MoviesController, SearchController],
  exports: [MoviesService, ReviewService]
})
export class MoviesModule { }
