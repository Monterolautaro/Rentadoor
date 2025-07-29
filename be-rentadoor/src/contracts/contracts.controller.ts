import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
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
} 