import { Model } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { Pokemon, PokemonDocument } from './pokemon.entity'
import { createPokemonDto, updatePokemonDto } from './pokemon.dtos';
import { PokedexResponse } from './pokedex.interface'

@Injectable()
export class PokemonsService {

    private pokeApiUrl: string
    private logger = new Logger('PokemonsService')

    constructor(
        @InjectModel(Pokemon.name) private PokemonModel: Model<PokemonDocument>,
        private httpService: HttpService,
        private config: ConfigService 
    ) {
        this.pokeApiUrl = this.config.get<string>('pokeApiBaseUrl');
    }

    async createPokemon(body: createPokemonDto) {
        const filter: any = {};
        let { name, pokemonNumber, imageUrl = undefined, trainerId } = body;
        
        name = name.toLowerCase().trim();
        filter.$or = [{ name }, { pokemonNumber }];
        if (trainerId) filter.trainerId = trainerId;

        const existingPokemon = await this.PokemonModel.findOne(filter);
        if (existingPokemon) throw new ConflictException(`Either the name: ${name} or the number: ${pokemonNumber} is already taken, please try other values`);

        // if there is no imageUrl then we try to consume the openApi from poke to get the image
        if (!imageUrl) {
            try {
                this.logger.log(`${this.pokeApiUrl}/pokemon/${name}`)
                const { data } = await this.httpService.axiosRef.get<PokedexResponse>(
                    `${this.pokeApiUrl}/pokemon/${name}`, 
                    {
                        headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
                    }
                );
                imageUrl = data.sprites.front_default;
            } catch (err) {
                this.logger.log(`${ err.response?.data?.message || JSON.stringify(err) }`);
            }
        }

        const newPokemon = new this.PokemonModel({ trainerId, name, pokemonNumber, pokemonId: uuidV4(), imageUrl: imageUrl || '' });
        return await newPokemon.save();
    }

    async getAllTrainerPokemon (trainerId: string) {
        return await this.PokemonModel.find({ trainerId });
    }

    async getPokemonById (id: string, trainerId?: string | undefined) {
        let pokemon;
        let filter:any = {};
        if (trainerId) filter.trainerId = trainerId

        if (!isNaN(+id)) {
            filter.pokemonNumber = +id;
            pokemon = await this.PokemonModel.findOne(filter);
        } else {
            filter.$or = [{ name: id.toLowerCase() }, { pokemonId: id }];
            pokemon = await this.PokemonModel.findOne(filter);
        }

        if (!pokemon) throw new NotFoundException(`No pokemon found for the given value ${id}`);
        return pokemon
    }

    async updatePokemon (body: updatePokemonDto, id: string, trainerId?: string | undefined) {

        const { name, pokemonNumber } = body;
        const doc = await this.PokemonModel.findOne({ pokemonId: id, trainerId });
        if (!doc) throw new NotFoundException(`No pokemon found for the given Id`);

        const conflictingPokemons = await this.PokemonModel.find({
            $or: [
                { name, trainerId, pokemonId: { $ne: id } }, 
                { pokemonNumber, trainerId, pokemonId: { $ne: id } }
            ]
        }).lean();
        if (conflictingPokemons.length) throw new ConflictException(`There are ${conflictingPokemons.length} conflicting documents, number and name must be unique`,)

        return await this.PokemonModel.findOneAndUpdate({ pokemonId: id, trainerId }, body, { new: true });
    }

    async deletePokemonById (id: string, trainerId?: string | undefined) {
        let filter:any = {};
        if (trainerId) filter.trainerId = trainerId
        filter.trainerId = trainerId;

        const deletedDoc = await this.PokemonModel.findOneAndDelete(filter);
        if (!deletedDoc) throw new NotFoundException(`No pokemon found for the given Id`);
        return
    }

}
