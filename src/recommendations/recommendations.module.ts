import { Module } from '@nestjs/common';
import { RecommendationsController } from './controller/recommendations.controller';
import { RecommendationService } from './service/recommendations.service';
import { IdentityModule } from 'src/identity/identity.module';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [IdentityModule, MoviesModule],
  controllers: [RecommendationsController],
  providers: [RecommendationService]
})
export class RecommendationsModule {
}
