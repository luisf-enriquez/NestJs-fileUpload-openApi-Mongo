import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module'
import { PokemonsModule } from './modules/pokemons/pokemons.module';
import { FilesModule } from './modules/files/files.module';
import { MessaggesWsModule } from './messagges-ws/messagges-ws.module';
import configuration from '../config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // validationSchema: Joi validation schema to check the config ts file
      isGlobal: true,
      ignoreEnvFile: true,
      load: [configuration] // here we load the config given in the ts file, whose values are managed using env vars
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService], // We inject the global config to access it wherever we want
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get<string>('database.url')
        }
      }
    }),
    AuthModule,
    PokemonsModule,
    FilesModule,
    MessaggesWsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
