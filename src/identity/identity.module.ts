import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { User, UserSchema } from './schema/user.schema';
import { AuthGuard } from './guards/auth.guard';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule,
    ],
    controllers: [UserController, AuthController],
    providers: [UserService, AuthService, AuthGuard],
    exports: [UserService, AuthGuard],
})
export class IdentityModule { }
