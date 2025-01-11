import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UserController, AuthController],
    providers: [UserService, AuthService],
    exports: [UserService],
})
export class IdentityModule { }
