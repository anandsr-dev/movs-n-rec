import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SIGNUP_RESPONSE_MESSAGES } from 'src/identity/constants/api';

describe('UserService', () => {
  let userService: UserService;
  let userModel: any;

  const mockUser = {
    _id: '1',
    username: 'john_doe',
    password: 'hashedPassword',
    name: 'John Doe',
    gender: 'male',
    state: 'CA',
    dob: new Date(),
    role: 'user',
    reviews: [],
    favoriteGenres: ['comedy', 'drama'],
    email: 'john@example.com',
  };

  const mockCreateUserDto: CreateUserDto = {
    username: 'john_doe',
    password: 'password123',
    name: 'John Doe',
    gender: 'male',
    state: 'CA',
    dob: '1994-09-10',
    role: 'user',
    email: 'john@example.com',
    favoriteGenres: ['Comedy'],
  };

  beforeEach(async () => {
    userModel = {
      create: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn().mockResolvedValue(mockUser),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockResolvedValue([mockUser]),
      lean: jest.fn().mockResolvedValue(mockUser),
      cursor: jest.fn().mockResolvedValue([mockUser]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signup', () => {
    it('should throw an exception if user already exists', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(mockUser);

      await expect(userService.signup(mockCreateUserDto)).rejects.toThrow(
        new HttpException(SIGNUP_RESPONSE_MESSAGES.USER_ALREADY_EXIST, HttpStatus.BAD_REQUEST),
      );
    });

    it('should successfully create a new user', async () => {
      const hashedPassword = await bcrypt.hash(mockCreateUserDto.password, 10);
      userModel.findOne = jest.fn().mockResolvedValue(null);
      userModel.create = jest.fn().mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const result = await userService.signup(mockCreateUserDto);
      expect(result.username).toBe(mockUser.username);
    });
  });

  describe('getUserInfo', () => {
    it('should return user info for a valid username', async () => {
      const result = await userService.getUserInfo({ username: 'john_doe' });
      expect(result).toEqual({
        userId: mockUser._id.toString(),
        username: mockUser.username,
        name: mockUser.name,
        gender: mockUser.gender,
        state: mockUser.state,
        dob: mockUser.dob.toISOString(),
        role: mockUser.role,
        reviews: mockUser.reviews,
        favoriteGenres: mockUser.favoriteGenres,
        email: mockUser.email,
      });
    });

    it('should return null if user is not found', async () => {
      userModel.findOne = jest.fn().mockResolvedValue(null);
      const result = await userService.getUserInfo({ username: 'non_existent_user' });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update the user successfully', async () => {
      const updatedUser = { ...mockUser, name: 'John Doe Updated' };
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.updateUser('1', { name: 'John Doe Updated' });
      expect(result.name).toBe('John Doe Updated');
    });
  });

  describe('findByGenresCursor', () => {
    it('should return users with matching favorite genres', async () => {
      const result = await userService.findByGenresCursor(['Comedy']);
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findUsersWithSimilarTaste', () => {
    it('should return users with similar favorite genres', async () => {
      const result = await userService.findUsersWithSimilarTaste(mockUser as any, 0, 20);
      expect(result).toEqual([mockUser]);
    });
  });
});
