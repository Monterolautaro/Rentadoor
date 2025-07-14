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
    UseGuards,
    Req,
    BadRequestException,
    ConflictException,
    Delete,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';
import { Request } from 'express';
import { AuthRepository } from '../auth/auth.repository';

// Extender el tipo Request para incluir user
interface RequestWithUser extends Request {
    user: {
        id: string;
        email: string;
        verified: boolean;
        rol: string;
    };
}

@Controller('storage')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly authRepository: AuthRepository
    ) { }

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FilesInterceptor('files', 2))
    async uploadFiles( 
        @UploadedFiles(new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({
                maxSize: 2000000 /*  2mb  */,
                message: 'file is too heavy',
              }),
            ],
            fileIsRequired: true,
          }),) files: Multer.File[], 
        @Req() req: RequestWithUser
    ) {

        if (!files || files.length !== 2) {
            throw new BadRequestException('Debes subir exactamente 2 archivos (selfie y DNI)');
        }

        const userId = req.user.id;

        const existingFiles = await this.storageService.getEncryptedFiles(userId);
        if (existingFiles.length > 0) {
            throw new ConflictException('Ya has subido documentos de verificación. No puedes volver a enviar.');
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

        const updateResult = await this.authRepository.updateIdentityVerificationStatus(userId, 'pending');

        return { selfie: selfieRecord, dni: dniRecord };
    }

    @Post('upload-property-images')
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN, Roles.USER)
    @UseInterceptors(FilesInterceptor('images', 10))
    async uploadPropertyImages(
        @UploadedFiles(new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({
                maxSize: 5000000 /* 5mb */,
                message: 'file is too heavy',
              }),
            ],
            fileIsRequired: true,
          }),) files: Multer.File[],
        @Req() req: RequestWithUser
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Debes subir al menos una imagen');
        }

        if (files.length > 10) {
            throw new BadRequestException('Puedes subir un máximo de 10 imágenes');
        }
        
        const userId = req.user.id;
        const uploadedImages: string[] = [];

        for (const file of files) {
            const imageUrl = await this.storageService.uploadPropertyImage(
                file.buffer,
                userId,
                file.originalname
            );
            uploadedImages.push(imageUrl);
        }

        return { images: uploadedImages };
    }

    @Get('property-image/:imageName')
    async getPropertyImage(@Param('imageName') imageName: string) {
        const imageUrl = await this.storageService.getPropertyImageUrl(imageName);
        return { url: imageUrl };
    }

    @Get('test-roles')
    @RolesDecorator(Roles.USER)
    @UseGuards(AuthGuard, RolesGuard)
    async testRoles() {
        return { message: 'Roles test successful' };
    }

    @Delete('property-image/:imageName')
    @RolesDecorator(Roles.ADMIN, Roles.USER)
    @UseGuards(AuthGuard, RolesGuard)
    async deletePropertyImage(
        @Param('imageName') imageName: string,
        @Req() req: RequestWithUser
    ) {
        const userId = req.user.id;
        await this.storageService.deletePropertyImage(imageName, userId);
        return { message: 'Imagen eliminada correctamente' };
    }

    @Get()
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async getAllFiles() {
        return await this.storageService.getEncryptedFiles();
    }

    @Get(':userId')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async getUserFiles(@Param('userId') userId: string) {
        return await this.storageService.getEncryptedFiles(userId);
    }

    @Get('download/:fileId')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async downloadFile(@Param('fileId') fileId: string) {
        const { fileName, buffer } = await this.storageService.downloadAndDecryptFile(fileId);

        return {
            fileName,
            base64: buffer.toString('base64'),
        };
    }
}
