import { Body, Controller, Post, HttpException, HttpStatus, Res, Get, Req, Query, Put } from "@nestjs/common";
import { Response, Request } from 'express';
import { AuthService } from "./auth.service";
import { LoginDto } from "src/dtos/login.dto";
import { SignUpDto } from "src/dtos/signup.dto";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('/me')
    async getCurrentUser(@Req() req: Request): Promise<any> {
        try {
            const token = req.cookies.authToken;

            if (!token) {
                return { authenticated: false };
            }

            const user = await this.authService.getCurrentUser(token);

            return {
                authenticated: true,
                user: user
            };
        } catch (error) {
            return { authenticated: false };
        }
    }

    @Post('/signup')
    async signUp(@Body() body: SignUpDto, @Res() res: Response): Promise<any> {
        try {
            const result = await this.authService.signUp(body);

            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000 // 1 hora
            });

            const { token, ...responseData } = result;
            return res.json(responseData);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('/signin')
    async login(@Body() body: LoginDto, @Res() res: Response): Promise<any> {
        try {
            console.log('🔐 Iniciando login para:', body.email);
            const result = await this.authService.login(body);
            console.log('✅ Login exitoso, configurando cookie...');

            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000 // 1 hora
            });

            console.log('🍪 Cookie configurada correctamente');
            const { token, ...responseData } = result;
            return res.json(responseData);
        } catch (error) {
            console.error('🚨 Error en login:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('/logout')
    async logout(@Res() res: Response): Promise<any> {
        try {
            const result = await this.authService.logout();

            res.clearCookie('authToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return res.json(result);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('/forgot-password')
    async forgotPassword(@Body() body: { email: string }): Promise<any> {
        try {
            return await this.authService.forgotPassword(body.email);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('/verify-reset-token')
    async verifyResetToken(@Query('token') token: string): Promise<any> {
        try {
            return await this.authService.verifyResetToken(token);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put('/reset-password')
    async resetPassword(@Body() body: { token: string; password: string }): Promise<any> {
        try {
            return await this.authService.resetPassword(body.token, body.password);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
