import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { Serialize } from '../../interceptors/serialize.interceptor';
import { AuthChecker } from '../../interceptors/authorization.interceptor';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { CreateUserDto, LoginDto, userOutputDto } from './user.dtos';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @AuthChecker({ checkSelfScope: false, roleNeeded: 'administrator' })
    @Serialize(userOutputDto)
    @Get('/users')
    @ApiResponse({ status: 200, description: 'Get all users', type: [userOutputDto] })
    async getUsers() {
        return await this.authService.getUsers();
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Serialize(userOutputDto)
    @AuthChecker({ checkSelfScope: true, roleNeeded: 'user' })
    @Get('/users/:id')
    async getUser(@Param('id', ParseUUIDPipe) id: string) {
        return await this.authService.getUserById(id);
    }

    @Post('/signup')
    @Serialize(userOutputDto)
    @ApiResponse({ status: 201, description: 'Get all users', type: userOutputDto })
    @HttpCode(201)
    async createUser(@Body() body: CreateUserDto) {
        return await this.authService.singUp(body);
    }

    @Post('/login')
    @ApiConsumes('application/x-www-form-urlencoded')
    @ApiBody({
        description: 'Your file',
        type: LoginDto,
    })
    async login (@Body() body: LoginDto) {
        return await this.authService.login(body);
    }

}
