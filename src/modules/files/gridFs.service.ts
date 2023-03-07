import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptionsFactory, MulterModuleOptions } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { GridFsStorage } from 'multer-gridfs-storage'

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
    gridFsStorage;
    private validMimeTypes: string[];

    constructor(private readonly config: ConfigService) {
        this.gridFsStorage = new GridFsStorage({
            url: config.get<string>('database.url'),
            file: (req, file) => {
                return { filename: file.originalname, bucketName: 'images' }
            }
        });

        this.validMimeTypes = config.get<string>('validMimeTypes').split(',');
    }

    createMulterOptions(): MulterOptions | Promise<MulterOptions> {
        const acceptedMimeTypes = this.validMimeTypes;
        return {
            storage: this.gridFsStorage,
            limits: {
                fileSize: this.config.get<number>('database.maxFileSize'),
            },
            fileFilter(req, file, cb) {
                let extensionMimeType = file.mimetype;
                if (!acceptedMimeTypes.includes(extensionMimeType)) 
                    return cb(new BadRequestException(`${extensionMimeType} is not supported`), false);
                
                return cb(null, true);
            }
        }
    }
}