import { Body, Controller, Get, HttpException, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AuthGuard } from '../guards/auth.guard';
import { ApiResponse } from 'src/common/helpers/api-response';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserInfo } from '../types/user.type';
import { RoleGuard } from '../../common/guards/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { CREATE_ADMIN_RESPONSE_MESSAGES, GET_USER_DETAILS, SIGNUP_RESPONSE_MESSAGES } from 'src/identity/constants/api';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    // User Signup
    @ApiCreatedResponse({ description: SIGNUP_RESPONSE_MESSAGES.USER_CREATED })
    @ApiBadRequestResponse({ description: SIGNUP_RESPONSE_MESSAGES.USER_ALREADY_EXIST })
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        if (createUserDto.role && createUserDto.role !== 'user') {
            throw new HttpException(SIGNUP_RESPONSE_MESSAGES.INVALID_ROLE, HttpStatus.BAD_REQUEST);
        }
        const user = await this.userService.signup(createUserDto);
        return ApiResponse.success<UserInfo>(SIGNUP_RESPONSE_MESSAGES.USER_CREATED, user);
    };

    @ApiBearerAuth()
    @UseGuards(
        AuthGuard,
        RoleGuard('superadmin')
    )
    @Post('admin')
    @ApiCreatedResponse({ description: CREATE_ADMIN_RESPONSE_MESSAGES.ADMIN_CREATED })
    @ApiCreatedResponse({ description: CREATE_ADMIN_RESPONSE_MESSAGES.USER_ALREADY_EXIST })
    async createAdmin(@Body() createUserDto: CreateUserDto) {
        createUserDto.role = 'admin';
        const user = await this.userService.signup(createUserDto);
        return ApiResponse.success<UserInfo>(CREATE_ADMIN_RESPONSE_MESSAGES.ADMIN_CREATED, user);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard)
    @Get('profile')
    @ApiOkResponse({ description: GET_USER_DETAILS.FETCHED_USER_DETAILS })
    async getUserInfo(@Req() req) {
        const res = await this.userService.getUserInfo(req.user);
        return ApiResponse.success(GET_USER_DETAILS.FETCHED_USER_DETAILS, res);
    }
}
