import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schema/user.schema';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

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
      findOne: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockUser),
        lean: jest.fn().mockResolvedValue(mockUser),
      })),
      findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
      find: jest.fn().mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([mockUser]),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockUser]),
        cursor: jest.fn().mockReturnValue(mockUser),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: await userModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('signup', () => {
    it('should throw an error if the username already exists', async () => {
      const createUserDto = { username: 'test', password: 'password' };
      const existingUser = { username: 'test' };

      jest.spyOn(userService, 'getUserInfo').mockResolvedValue(existingUser as any);

      await expect(userService.signup(createUserDto as any)).rejects.toThrow(
        new HttpException('User already exists', HttpStatus.BAD_REQUEST),
      );
    });

    it('should successfully create a new user', async () => {
      const hashedPassword = await bcrypt.hash(mockCreateUserDto.password, 10);
      jest.spyOn(userService, 'getUserInfo').mockResolvedValue(null);
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
      const nonExistentUser = { username: 'non_existent_user' };
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),  // mock the return value of lean()
        exec: jest.fn().mockResolvedValue(null),  // mock the return value of exec()
      };
    
      userModel.findOne = jest.fn().mockReturnValue(mockQuery);
    
      const result = await userService.getUserInfo(nonExistentUser);
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
      expect(result).toEqual(mockUser);
    });
  });

  describe('findUsersWithSimilarTaste', () => {
    it('should return users with similar favorite genres', async () => {
      const result = await userService.findUsersWithSimilarTaste(mockUser as any, 0, 20);
      expect(result).toEqual([mockUser]);
    });
  });
});
