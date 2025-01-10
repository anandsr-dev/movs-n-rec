import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { IdentityModule } from './identity/identity.module';
// import { AuthModule } from './auth/auth.module';
// import { UserModule } from './user/user.module';

import { AppController } from './app.controller';

import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/movs-n-rec'),
    ConfigModule.forRoot({ isGlobal: true }),
    IdentityModule,
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
