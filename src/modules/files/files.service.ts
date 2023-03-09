import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Connection } from 'mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { GridFSBucketReadStream, ObjectId, GridFSBucket } from 'mongodb'
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {

    private fileModel: MongoGridFS;
    private logger = new Logger('FilesService')
    private bucket: GridFSBucket;
    private bucketName: string;
    
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly config: ConfigService
    ) {
        this.bucketName = this.config.get<string>('database.bucketName');
        this.fileModel = new MongoGridFS(this.connection.db as any, this.bucketName);
        this.bucket = new GridFSBucket(this.connection.db as any, { bucketName: this.bucketName });
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
        await this.connection.collection(`${this.bucketName}.files`).deleteOne({ _id: this.getObjectId(id) });
        await this.connection.collection(`${this.bucketName}.chunks`).deleteMany({ files_id: this.getObjectId(id) });
        return; 
    }
}
