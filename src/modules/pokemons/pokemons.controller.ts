import { Body, Controller, Post, Req, UseGuards, Get, Param, ParseUUIDPipe, HttpCode, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthChecker, GetUser } from '../../interceptors/authorization.interceptor';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { createPokemonDto, updatePokemonDto } from './pokemon.dtos';
import { Pokemon } from './pokemon.entity';
import { PokemonsService } from './pokemons.service';

@ApiTags('Pokemons')
@ApiBearerAuth()
@Controller('/pokemons')
@UseGuards(JwtAuthGuard)
export class PokemonsController {

    constructor(private pokemonService: PokemonsService) {}

    @Post()
    @AuthChecker({ checkSelfScope: true, roleNeeded: 'user' })
    @ApiResponse({ status: 201, description: 'Pokemon created successfully', type: Pokemon })
    @HttpCode(201)
    async createPokemon (@Body() body: createPokemonDto, @GetUser() user) {
        body.trainerId = user.userId;
        return await this.pokemonService.createPokemon(body);
    }

    @Get('/trainer/:id')
    @AuthChecker({ checkSelfScope: true, roleNeeded: 'user' })
    @ApiResponse({ status: 200, description: 'Get all trainer pokemons', type: [Pokemon] })
    async getAllTrainerPokemon (@Param('id', ParseUUIDPipe) id: string) {
        return await this.pokemonService.getAllTrainerPokemon(id);
    }

    // here we look for either the pokemon number the name or the unique identifier
    @Get('/:id')
    @AuthChecker({ checkSelfScope: false, roleNeeded: 'user' })
    async getPokemonById (@Param('id') id: string, @GetUser() user) {
        const trainerId = user.role !== 'administrator' ? user.userId : undefined;
        return await this.pokemonService.getPokemonById(id, trainerId);
    }

    @Patch('/:pokemonId')
    @AuthChecker({ checkSelfScope: true, roleNeeded: 'user' })
    async updatePokemonById (@Param('pokemonId', ParseUUIDPipe) id: string, @Body() body: updatePokemonDto , @GetUser() user) {
        const trainerId = body.trainerId || user.userId || undefined;
        return await this.pokemonService.updatePokemon(body, id, trainerId);
    }

    @Delete('/:pokemonId')
    @HttpCode(204)
    @AuthChecker({ checkSelfScope: false, roleNeeded: 'user' })
    async deletePokemonById (@Param('pokemonId', ParseUUIDPipe) id: string, @GetUser() user) {
        const trainerId = user.role !== 'administrator' ? user.userId : undefined;
        return await this.pokemonService.deletePokemonById(id, trainerId);
    }

}   
