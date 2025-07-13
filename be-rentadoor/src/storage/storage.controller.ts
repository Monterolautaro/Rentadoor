import {
    Controller,
    Post,
    Get,
    Param,
    UploadedFiles,
    UseInterceptors,
    Body,
    MaxFileSizeValidator,
    FileTypeValidator,
    ParseFilePipe,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files', 2))
    async uploadFiles( @UploadedFiles(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000 /*  2mb  */,
            message: 'file is too heavy',
          }),
        ],
        fileIsRequired: true,
      }),) files: Multer.File[], @Body('userId') userId: string,) {

        if (!files || files.length !== 2) {
            throw new Error('Debes subir exactamente 2 archivos (selfie y DNI)');
        }

        const [selfie, dni] = files;

        const selfieRecord = await this.storageService.uploadEncryptedFile(
            selfie.buffer,
            userId,
            `selfie_${selfie.originalname}`,
        );

        const dniRecord = await this.storageService.uploadEncryptedFile(
            dni.buffer,
            userId,
            `dni_${dni.originalname}`,
        );

        return { selfie: selfieRecord, dni: dniRecord };
    }

    @Get()
    async getAllFiles() {
        return await this.storageService.getEncryptedFiles();
    }

    @Get(':userId')
    async getUserFiles(@Param('userId') userId: string) {
        return await this.storageService.getEncryptedFiles(userId);
    }

    @Get('download/:fileId')
    async downloadFile(@Param('fileId') fileId: string) {
        const { fileName, buffer } = await this.storageService.downloadAndDecryptFile(fileId);

        return {
            fileName,
            base64: buffer.toString('base64'),
        };
    }
}
