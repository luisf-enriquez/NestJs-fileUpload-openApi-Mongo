import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { GridFSBucketReadStream, ObjectId, GridFSBucket } from 'mongodb'
import { FileInfoVm } from './files.dtos';
import { response } from 'express';
import { ObjectID } from 'bson';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {

    private fileModel: MongoGridFS;
    private logger = new Logger('FilesService')
    private bucket: GridFSBucket;
    
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly config: ConfigService
    ) {
        const bucketName = this.config.get<string>('database.bucketName');
        this.fileModel = new MongoGridFS(this.connection.db, bucketName);
        this.bucket = new GridFSBucket(this.connection.db, { bucketName });
    }

    getObjectId(id: string) { return new mongoose.Types.ObjectId(id) }

    async findInfo(id: string): Promise<any> {
        let result = await this.fileModel.findById(id)
                    .catch( err => {throw new NotFoundException(`No file found for the given id ${id}`)} )
                    .then(result => result)
        
        return {
            filename: result.filename,
            length: result.length,
            chunkSize: result.chunkSize,
            contentType: result.contentType 
        }
    }

    async readStream(id: string): Promise<GridFSBucketReadStream> {
        return await this.fileModel.readFileStream(id);
    }

    async deleteFile(id: string): Promise<any> {
        const file = await this.fileModel.findById(id)
                            .catch( err => {throw new NotFoundException(`No file found for the given id ${id}`)} )
                            .then(result => result)
        return await this.bucket.delete(this.getObjectId(id));
    }
}
