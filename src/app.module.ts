import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './identity/identity.module';
// import { AuthModule } from './auth/auth.module';
// import { UserModule } from './user/user.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { SharedModule } from './shared/shared.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/movs-n-rec'),
    ConfigModule.forRoot({ isGlobal: true }),
    IdentityModule,
    MoviesModule,
    SharedModule,
    JwtModule.register({ global: true }),
    RecommendationsModule,
    EventEmitterModule.forRoot(),
    AnalyticsModule
    ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
