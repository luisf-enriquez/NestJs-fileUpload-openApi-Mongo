import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  @ApiProperty()
  @Prop({ index: true })
  userId: string;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty()
  @Prop({ required: true, default: 'user', enum: ['administrator', 'user'] })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);