import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type PokemonDocument = HydratedDocument<Pokemon>;

@Schema({ timestamps: true })
export class Pokemon {

  @ApiProperty()
  @Prop({ index: true })
  pokemonId: string;

  @ApiProperty()
  @Prop({ index: true, required: true })
  pokemonNumber: number;

  @ApiProperty()
  @Prop({ index: true, required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: false })
  imageUrl: string;

  @ApiProperty()
  @Prop({ required: true })
  trainerId: string;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);