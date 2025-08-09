import { Controller, Post, Get, Body, Param, UploadedFile, UseInterceptors, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPayment(
    @UploadedFile() file: any,
    @Body() body: { reservationId: number, userId: number, type: string }
  ) {
    return this.paymentsService.uploadPayment(file, body.reservationId, body.userId, body.type);
  }

  @Get('by-reservation/:reservationId')
  async getPaymentsByReservation(@Param('reservationId') reservationId: number) {
    return this.paymentsService.getPaymentsByReservation(reservationId);
  }

  @Post('approve')
  async approvePayment(@Body() body: { reservationId: number }) {
    return this.paymentsService.approvePayment(body.reservationId);
  }

  @Post('reject')
  async rejectPayment(@Body() body: { reservationId: number, motivo?: string }) {
    return this.paymentsService.rejectPayment(body.reservationId, body.motivo);
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: number) {
    return this.paymentsService.deletePayment(id);
  }
}
