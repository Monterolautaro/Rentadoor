import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesDecorator } from '../common/decorators/roles.decorator';
import { Roles } from '../common/enums/roles.enum';
import { IRequestWithUser } from './interfaces/requestwithuser.interface';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: IRequestWithUser) {
    const ownerId = parseInt(req.user.id);
    return this.propertiesService.create(createPropertyDto, ownerId);
  }

  @Get()
  async findAll(@Query() filters: any) {
    if (Object.keys(filters).length > 0) {
      return this.propertiesService.searchProperties(filters);
    }
    return this.propertiesService.findAll();
  }

  @Get('available')
  async getAvailableProperties() {
    return this.propertiesService.getAvailableProperties();
  }

  @Get('my-properties')
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async findMyProperties(@Req() req: IRequestWithUser) {
    const ownerId = parseInt(req.user.id);
    return this.propertiesService.findByOwner(ownerId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.propertiesService.findOne(id);
  }

  @Patch(':id')
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: IRequestWithUser
  ) {
    const userId = parseInt(req.user.id);
    return this.propertiesService.update(id, updatePropertyDto, userId);
  }

  @Delete(':id')
  @RolesDecorator(Roles.ADMIN, Roles.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: IRequestWithUser) {
    const userId = parseInt(req.user.id);
    return this.propertiesService.remove(id, userId);
  }

  @Get('admin/all')
  @RolesDecorator(Roles.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async getAllPropertiesForAdmin() {
    return this.propertiesService.findAll();
  }
} 