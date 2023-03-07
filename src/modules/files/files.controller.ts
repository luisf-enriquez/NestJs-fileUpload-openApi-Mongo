import { Post, Get, Param, Res, Controller, UseInterceptors, UploadedFile, Delete, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express/multer';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ValidateMongoId } from './cusotmPipes';
import { FileInfoVm, FileUploadDto } from './files.dtos';
import { FilesService } from './files.service';

@ApiTags('File upload-download')
@ApiBearerAuth()
@Controller('/files')
@UseGuards(JwtAuthGuard)
export class FilesController {

    constructor(private filesService: FilesService) {}

    @Post('')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Your file',
        type: FileUploadDto,
    })
    upload(@UploadedFile() file){
        return {
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            id: file.id,
            filename: file.filename,
            metadata: file.metadata,
            bucketName: file.bucketName,
            chunkSize: file.chunkSize,
            size: file.size,
            md5: file.md5,
            uploadDate: file.uploadDate,
            contentType: file.contentType,
        }
    }

    @Get('/:id')
    async getFileInfo(@Param('id', ValidateMongoId) id: string): Promise<FileInfoVm> {
        return await this.filesService.findInfo(id);
    }

    @Get('/view/:id')
    async viewFile(@Param('id', ValidateMongoId) id: string, @Res() res){
        const file = await this.filesService.findInfo(id);
        const fileStream = await this.filesService.readStream(id);
        if (!fileStream) throw new HttpException('An error occurred while retrieving file', HttpStatus.EXPECTATION_FAILED)
        res.header('Content-Type', file.contentType);
        return fileStream.pipe(res);
    }

    @Get('/download/:id')
    async downloadFile(@Param('id', ValidateMongoId) id: string, @Res() res){
        const file = await this.filesService.findInfo(id);        
        const fileStream = await this.filesService.readStream(id);
        if(!fileStream)
            throw new HttpException('An error occurred while retrieving file', HttpStatus.EXPECTATION_FAILED)
 
        res.header('Content-Type', file.contentType);
        res.header('Content-Disposition', `attachment; filename=${file.filename}`);
        return fileStream.pipe(res);
    }

    @Delete('/:id')
    async deleteFile(@Param('id', ValidateMongoId) id: string){
        const result = await this.filesService.deleteFile(id);
        return { message: 'file deleted successfully' }
    }
}
