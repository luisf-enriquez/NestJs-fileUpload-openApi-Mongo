import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios'
import { AuthModule } from '../auth/auth.module';
import { Pokemon, PokemonSchema } from './pokemon.entity';
import { PokemonsController } from './pokemons.controller';
import { PokemonsService } from './pokemons.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Pokemon.name, schema: PokemonSchema }]),
    AuthModule,
    HttpModule
  ],
  controllers: [PokemonsController],
  providers: [PokemonsService]
})

export class PokemonsModule {}
