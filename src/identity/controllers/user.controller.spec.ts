import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { ApiResponse } from 'src/common/helpers/api-response';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

jest.mock('../services/user.service');

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        signup: jest.fn(),
                        getUserInfo: jest.fn(),
                        updateUser: jest.fn(),
                    },
                },
            ],
        }).overrideGuard(AuthGuard).useValue({ canActivate: jest.fn(() => true) })
          .overrideGuard(RoleGuard).useValue({ canActivate: jest.fn(() => true) })
          .compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('signup', () => {
        it('should throw an error if role is not user', async () => {
            const dto: CreateUserDto = { username: 'test', password: '1234', role: 'admin', name: 'anand', dob: '1994-09-10',favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };
            await expect(controller.signup(dto)).rejects.toThrow(new HttpException('Invalid role value', HttpStatus.BAD_REQUEST));
        });

        it('should create a user with role user', async () => {
            const dto: CreateUserDto = { username: 'test', password: '1234', role: 'user', name: 'anand', dob: '1994-09-10',favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };
            const mockUser: any = { userId: '1', username: 'test', role: 'user', name: 'anand', dob: '1994-09-10', favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };

            jest.spyOn(userService, 'signup').mockResolvedValue(mockUser);

            const result = await controller.signup(dto);
            expect(userService.signup).toHaveBeenCalledWith(dto);
            expect(result).toEqual(ApiResponse.success('User registered successfully', mockUser));
        });
    });

    describe('createAdmin', () => {
        it('should create an admin user', async () => {
            const dto: CreateUserDto = { username: 'adminuser', password: 'adminuser', role: 'admin', name: 'anand', dob: '1994-09-10', favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };
            const mockAdmin: any = { userId: '1', username: 'admin', role: 'admin', name: 'anand', dob: '1994-09-10', favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };

            jest.spyOn(userService, 'signup').mockResolvedValue(mockAdmin);

            const result = await controller.createAdmin(dto);
            expect(userService.signup).toHaveBeenCalledWith({ ...dto, role: 'admin' });
            expect(result).toEqual(ApiResponse.success('Admin registered successfully', mockAdmin));
        });
    });

    describe('getUserInfo', () => {
        it('should fetch user information', async () => {
            const req = { user: { id: '1' } };
            const mockUser: any = { userId: '1', username: 'admin', role: 'admin', name: 'anand', dob: '1994-09-10', favoriteGenres: ['Action'], email: 'anands7894@gmail.com', gender: 'male', state: 'kerala' };

            jest.spyOn(userService, 'getUserInfo').mockResolvedValue(mockUser);

            const result = await controller.getUserInfo(req);
            expect(userService.getUserInfo).toHaveBeenCalledWith(req.user);
            expect(result).toEqual(ApiResponse.success('User details fetched successfully', mockUser));
        });
    });

    describe('updateUserDetails', () => {
        it('should update user details', async () => {
            const req = { user: { userId: '1' } };
            const dto: UpdateUserDto = { name: 'updatedTest' };

            jest.spyOn(userService, 'updateUser').mockResolvedValue(null);

            const result = await controller.updateUserDetails(req, dto);
            expect(userService.updateUser).toHaveBeenCalledWith(req.user.userId, dto);
            expect(result).toEqual(ApiResponse.success('User details updated successfully', null));
        });

        it('should throw an error if user is not authenticated', async () => {
            const req = {};
            const dto: UpdateUserDto = { name: 'updatedTest' };

            await expect(controller.updateUserDetails(req, dto)).rejects.toThrow('Invalid or expired access token');
        });
    });
});