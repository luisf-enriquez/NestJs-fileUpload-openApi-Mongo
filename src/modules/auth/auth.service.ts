import { Model } from 'mongoose';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidV4 } from 'uuid';

import { User, UserDocument } from './user.entity'
import { CreateUserDto, LoginDto } from './user.dtos';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    private logger = new Logger('AuthService');
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService
    ) {}

    async getUsers() {
        return await this.userModel.find({});
    }

    async getUserById(userId: string) {
        this.logger.log(`Fetching user ${userId}`);
        const user = await this.userModel.findOne({ userId });
        if (!user) throw new NotFoundException(`no user found for the given Id: ${userId}`);
        return user;
    }

    async singUp(body: CreateUserDto) {
        this.logger.log(`Creating user ...`)
        const existingUser = await this.userModel.findOne({ email: body.email });
        if (existingUser) throw new ConflictException(`Given email is already in usage`);
        body.password = await bcrypt.hash(body.password, 10);
        const newUser = new this.userModel({ userId: uuidV4(), ...body });
        return await newUser.save();
    }

    async login(body: LoginDto) {
        const { email, password } = body;
        const user = await this.userModel.findOne({ email });
        if (!user) throw new BadRequestException(`Please check your credentials`);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new BadRequestException(`Please check your credentials`);

        const claims = { email, userId: user.userId, role: user.role, name: user.name };
        const accessToken = this.jwtService.sign(claims);
        return { accessToken };
    }
}
