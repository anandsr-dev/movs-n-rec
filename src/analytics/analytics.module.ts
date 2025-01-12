import { Module } from '@nestjs/common';
import { AnalyticsService } from './service/analytics.service';
import { AnalyticsController } from './controller/analytics.controller';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [MoviesModule],
  providers: [AnalyticsService],
  controllers: [AnalyticsController]
})
export class AnalyticsModule { }
