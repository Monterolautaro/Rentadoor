import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, NotFoundException, UnauthorizedException, UseGuards, Param, Patch, Delete, Put, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { RolesDecorator } from "src/common/decorators/roles.decorator";
import { Roles } from "src/common/enums/roles.enum";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { IUser } from "./interfaces/user.interface";


@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('/email')
    async getUserByEmail(@Body('body') body: any) {
        try {

            return this.userService.getUserByEmail(body)

        } catch (error) {

            if (error instanceof NotFoundException) {
                throw new HttpException({
                    message: 'Usuario no encontrado',
                    statusCode: 404
                }, HttpStatus.NOT_FOUND);
            }

            throw error;

        }
    }

    @Get()
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async getUsers(): Promise<IUser[]> {
        try {
            return this.userService.getUsers()
        } catch (error) {
            if (typeof NotFoundException) throw new NotFoundException('No se encontraron usuarios en el sistema')

            if (typeof BadRequestException) throw new BadRequestException('Ocurrió un error en el sistema')

            if (typeof UnauthorizedException) throw new UnauthorizedException('No tienes permisos para acceder a los usuarios')

            throw new error;
        }
    }

    @Get(':id')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async getUser(@Param('id') id: number) {
        return this.userService.getUserById(id);
    }

    @Get('public/:id')
    async getUserPublic(@Param('id') id: number) {
        const user = await this.userService.getUserById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        // Solo exponer los campos públicos
        return {
            nombre: user.nombre,
            email: user.email,
            telefono: user.telefono
        };
    }

    @Patch(':id')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async updateUser(@Param('id') id: number, @Body() update: Partial<IUser>) {
        return this.userService.updateUser(id, update);
    }

    @Patch(':id/suspend')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async suspendUser(@Param('id') id: number, @Body('suspend') suspend: boolean) {
        return this.userService.suspendUser(id, suspend);
    }

    @Delete(':id')
    @RolesDecorator(Roles.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    async deleteUser(@Param('id') id: number) {
        return this.userService.deleteUser(id);
    }

    @Post('owner/reject/:id')
    async rejectOwner(){

    }
}