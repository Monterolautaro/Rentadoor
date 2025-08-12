import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards, UploadedFile, UseInterceptors, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async create(@Body() createDto: CreateReservationDto, @Req() req) {
    return this.reservationsService.create(createDto, Number(req.user.id));
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async findByUser(@Param('userId', ParseIntPipe) userId: number, @Req() req) {
    if (Number(req.user.id) !== userId && req.user.rol !== 'admin') throw new Error('No autorizado');
    return this.reservationsService.findByUser(userId);
  }

  @Get('property/:propertyId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number, @Req() req) {
    return this.reservationsService.findByProperty(propertyId);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  async findAll(@Req() req) {
    return this.reservationsService.findAll();
  }

  @Get('owner/:ownerId')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async findByOwner(@Param('ownerId', ParseIntPipe) ownerId: number, @Req() req) {
    if (Number(req.user.id) !== ownerId && req.user.rol !== 'admin') throw new Error('No autorizado');
    return this.reservationsService.findByOwner(ownerId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationsService.findById(id, Number(req.user.id), req.user.rol);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateReservationDto, @Req() req) {
    return this.reservationsService.update(id, updateDto, Number(req.user.id), req.user.rol);
  }

  @Patch(':id/admin-approve')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN)
  async adminApprove(@Param('id') id: number, @Req() req) {
    return this.reservationsService.adminApprove(id, req.user.id, req.user.rol);
  }

  @Patch(':id/owner-approve')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async ownerApprove(@Param('id') id: number, @Req() req) {
    return this.reservationsService.ownerApprove(id, req.user.id, req.user.rol);
  }

  @Patch(':id/owner-reject')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  async ownerReject(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationsService.ownerReject(id, req.user.id, req.user.rol);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.reservationsService.remove(id, Number(req.user.id), req.user.rol);
  }

  @Post('upload-document')
  @UseGuards(AuthGuard, RolesGuard)
  @RolesDecorator(Roles.USER, Roles.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Multer.File, @Req() req: any) {
    return { url: await this.reservationsService.uploadDocument(file, req.user.id) };
  }

  @Post(':reservationId/co-earners')
  async addCoEarner(
    @Param('reservationId', ParseIntPipe) reservationId: number,
    @Body() dto: {
      full_name: string;
      dni?: string;
      cuit_cuil?: string;
      income_source?: string;
      employer_name?: string;
      income_amount?: number;
    }
  ) {
    return this.reservationsService.addCoEarner({ ...dto, reservation_id: reservationId });
  }

  @Get(':reservationId/co-earners')
  async getCoEarners(@Param('reservationId', ParseIntPipe) reservationId: number) {
    return this.reservationsService.getCoEarnersByReservation(reservationId);
  }
} 