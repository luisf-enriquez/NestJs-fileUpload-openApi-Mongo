import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator'

export class LoginDto {

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;
}

export class CreateUserDto extends LoginDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsIn(['administrator', 'user'])
    role: string;
}

export class userOutputDto {

    @ApiProperty()
    @Expose()
    userId: string;

    @ApiProperty()
    @Expose()
    name: string;

    @ApiProperty()
    @Expose()
    email: string;

    @ApiProperty()
    @Expose()
    role: string;

    @ApiProperty()
    @Expose()
    createdAt: Date;
}