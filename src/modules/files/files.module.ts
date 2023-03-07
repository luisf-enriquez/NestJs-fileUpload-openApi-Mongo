import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { GridFsMulterConfigService } from './gridFs.service'
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      useClass: GridFsMulterConfigService
    }),
    AuthModule
  ],
  controllers: [FilesController],
  providers: [GridFsMulterConfigService, FilesService]
})
export class FilesModule {}
