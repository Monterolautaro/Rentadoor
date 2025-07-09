import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { UserService } from "./user.service";


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
}