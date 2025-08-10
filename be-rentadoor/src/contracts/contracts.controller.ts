import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('upload')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadContract(
    @UploadedFile() file: any,
    @Body() body: { reservationId: number }
  ) {
    return this.contractsService.uploadContract(file, body.reservationId);
  }

  @Get('by-reservation/:reservationId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  async getContractByReservation(@Param('reservationId') reservationId: number) {
    return this.contractsService.getContractByReservation(reservationId);
  }

  @Get('download/:contractId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  async downloadContract(@Param('contractId') contractId: number) {
    const { fileName, buffer } = await this.contractsService.downloadAndDecryptContract(contractId);
    return {
      fileName,
      base64: buffer.toString('base64'),
    };
  }

  @Get('download-pdf/:reservationId')
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async downloadContractPdf(@Param('reservationId') reservationId: number) {
    const contract = await this.contractsService.getContractByReservation(reservationId);
    if (!contract || !contract.file_url) throw new NotFoundException('Contrato no encontrado');
    const supabase = this.contractsService['supabaseService'].getClient();
    const { data, error } = await supabase.storage
      .from('contracts')
      .download(contract.file_url);
    if (error) throw new BadRequestException('Error descargando contrato: ' + error.message);
    const buffer = Buffer.from(await data.arrayBuffer());
    return {
      fileName: `contrato_${reservationId}.pdf`,
      base64: buffer.toString('base64'),
    };
  }
} 