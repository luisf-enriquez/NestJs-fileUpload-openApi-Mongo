import { Expose, Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsInt, IsUrl, IsUUID, IsOptional } from 'class-validator';

export class createPokemonDto {

    @ApiProperty({ example: '1', type: Number, minimum: 1 })
    @IsInt()
    @IsNotEmpty()
    pokemonNumber: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string

    @ApiProperty()
    @IsUrl()
    @IsOptional()
    imageUrl: string

    @ApiProperty()
    @IsUUID()
    @IsOptional()
    @IsNotEmpty()
    trainerId?: string
}

export class updatePokemonDto extends PartialType(createPokemonDto){

}