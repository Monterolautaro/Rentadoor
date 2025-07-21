import { Controller, Post, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/common/enums/roles.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('reject-reservation/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  async rejectReservation(@Param('id', ParseIntPipe) id: number, @Body('note') note: string) {
    return this.adminService.reject('reservation', id, note);
  }

  @Post('reject-verification/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  async rejectVerification(@Param('userId', ParseIntPipe) userId: number, @Body('note') note: string) {
    return this.adminService.reject('verification', userId, note);
  }
}