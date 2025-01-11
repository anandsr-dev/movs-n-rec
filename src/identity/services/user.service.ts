import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { FindUserDto } from '../dto/find-user.dto';
import { UserInfo } from '../types/user.type';
import * as bcrypt from 'bcrypt';
import { SIGNUP_RESPONSE_MESSAGES } from 'src/identity/constants/api';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    private getFormattedUser(user: UserDocument): UserInfo {
        const formattedUser: UserInfo = {
            userId: user._id.toString(),
            username: user.username,
            name: user.name,
            gender: user.gender,
            state: user.state,
            dob: user.dob.toISOString(),
            role: user.role,
            reviews: user.reviews
        };
        return formattedUser;
    }

    async signup(createUserDto: CreateUserDto): Promise<UserInfo> {
        const existingUser = await this.getUserInfo({ username: createUserDto.username });
        if (existingUser) {
            throw new HttpException(SIGNUP_RESPONSE_MESSAGES.USER_ALREADY_EXIST, HttpStatus.BAD_REQUEST);
        }
        const hashedPass = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.createUser({
            ...createUserDto,
            password: hashedPass
        });
        return user;
    };

    // Create a new user
    async createUser(createUserDto: CreateUserDto): Promise<UserInfo> {
        const user = await this.userModel.create(createUserDto);
        return this.getFormattedUser(user);
    }

    async getUser(getUserDto: FindUserDto): Promise<FlattenMaps<UserDocument>> {
        const query = getUserDto.userId ? { _id: getUserDto.userId } : { username: getUserDto.username };
        const user = await this.userModel.findOne(query).lean();
        return user;
    }

    async getUserInfo(getUserDto: FindUserDto): Promise<UserInfo | null> {
        const query = getUserDto.userId ? { _id: getUserDto.userId } : { username: getUserDto.username };
        const user = await this.userModel.findOne(query).lean();
        if (user === null) {
            return null;
        }
        return this.getFormattedUser(user);
    }

    async updateUser(userId: string, updateQuery: UpdateQuery<User>) {
        return await this.userModel.findByIdAndUpdate(userId, updateQuery, { new: true });
    }
}
