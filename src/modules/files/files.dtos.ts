import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class FileInfoVm {

    @Expose()
    length: number;

    @Expose()
    chunkSize: number;

    @Expose()
    filename: string;    

    @Expose()
    contentType: string;
}

export class FileUploadDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
  }