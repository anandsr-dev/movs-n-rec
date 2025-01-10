import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiResponse } from 'src/common/helpers/api-response';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';
import { RoleGuard } from '../../common/guards/role.guard';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    // User Signup
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        if (createUserDto.role && createUserDto.role !== 'user') {
            throw new HttpException('Invalid role value', HttpStatus.BAD_REQUEST);
        }
        const user = await this.userService.signup(createUserDto);
        return ApiResponse.success<UserDto>('User registered successfully', user);
    };

    @UseGuards(
        AuthGuard,
        RoleGuard('superadmin')
    )
    @Post('admin')
    async createAdmin(@Body() createUserDto: CreateUserDto) {
        createUserDto.role = 'admin';
        const user = await this.userService.signup(createUserDto);
        return ApiResponse.success<UserDto>('Admin registered successfully', user);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getUserInfo(@Req() req) {
        const res = await this.userService.getUserInfo(req.user);
        return ApiResponse.success('User details fetched successfully', res);
    }
}
