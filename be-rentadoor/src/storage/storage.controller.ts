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
        role: string;
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

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN)
    async getAllFiles() {
        return await this.storageService.getEncryptedFiles();
    }

    @Get(':userId')
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN)
    async getUserFiles(@Param('userId') userId: string) {
        return await this.storageService.getEncryptedFiles(userId);
    }

    @Get('download/:fileId')
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN)
    async downloadFile(@Param('fileId') fileId: string) {
        const { fileName, buffer } = await this.storageService.downloadAndDecryptFile(fileId);

        return {
            fileName,
            base64: buffer.toString('base64'),
        };
    }
}
