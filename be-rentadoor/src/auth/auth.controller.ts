import { Body, Controller, Post, HttpException, HttpStatus, Res, Get, Req, Query, Put, UseGuards, Param } from "@nestjs/common";
import { Response, Request } from 'express';
import { AuthService } from "./auth.service";
import { LoginDto } from "../dtos/login.dto";
import { SignUpDto } from "../dtos/signup.dto";
import { AuthGuard } from "./guards/auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { RolesDecorator } from "../common/decorators/roles.decorator";
import { Roles } from "../common/enums/roles.enum";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('/test-cookies')
    async testCookies(@Req() req: Request): Promise<any> {
        return {
            allCookies: req.cookies,
            authToken: req.cookies?.authToken ? 'present' : 'missing',
            refreshToken: req.cookies?.refreshToken ? 'present' : 'missing'
        };
    }

    @Get('/test-set-cookie')
    async testSetCookie(@Res() res: Response): Promise<any> {
        console.log('🔧 [TEST-SET-COOKIE] Configuración:', {
            NODE_ENV: process.env.NODE_ENV,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict'
        });

        res.cookie('testCookie', 'test-value', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
            maxAge: 3600000, // 1 hora
            path: '/'
        });

        console.log('🔧 [TEST-SET-COOKIE] Headers de respuesta:', {
            'set-cookie': res.getHeaders()['set-cookie']
        });

        return res.json({ 
            message: 'Test cookie set',
            config: {
                NODE_ENV: process.env.NODE_ENV,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict'
            }
        });
    }

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

            console.log('🔧 [SIGNUP] Configuración de cookie:', {
                NODE_ENV: process.env.NODE_ENV,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                hasToken: !!result.token
            });

            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                maxAge: 3600000, // 1 hora
                path: '/'
            });

            console.log('🔧 [SIGNUP] Cookie configurada, headers de respuesta:', {
                'set-cookie': res.getHeaders()['set-cookie']
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
            const result = await this.authService.login(body);

            console.log('🔧 [SIGNIN] Configuración de cookie:', {
                NODE_ENV: process.env.NODE_ENV,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                hasToken: !!result.token
            });

            res.cookie('authToken', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                maxAge: 3600000, // 1 hora
                path: '/'
            });

            console.log('🔧 [SIGNIN] Cookie configurada, headers de respuesta:', {
                'set-cookie': res.getHeaders()['set-cookie']
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

    @Post('/logout')
    async logout(@Res({ passthrough: true }) res: Response): Promise<any> {
        res.clearCookie('authToken');
        res.clearCookie('refreshToken');
        return { message: 'Logout successful' };
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

    @Post('/verify-email')
    async verifyEmail(@Body() body: { token: string }): Promise<any> {
        try {
            return await this.authService.verifyEmail(body.token);
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

    @Post('/resend-verification')
    async resendVerification(@Body() body: { email: string }): Promise<any> {
        try {
            return await this.authService.resendVerification(body.email);
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

    @Post('/admin/approve-identity/:userId')
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN)
    async approveIdentityVerification(@Param('userId') userId: string): Promise<any> {
        try {
            return await this.authService.approveIdentityVerification(userId);
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

    @Post('/admin/reject-identity/:userId')
    @UseGuards(AuthGuard, RolesGuard)
    @RolesDecorator(Roles.ADMIN)
    async rejectIdentityVerification(@Param('userId') userId: string): Promise<any> {
        try {
            return await this.authService.rejectIdentityVerification(userId);
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

    @Post('/test-token')
    async testToken(@Body() body: { email: string, id: number, role: string }, @Res() res: Response): Promise<any> {
        try {
            const payload = {
                id: body.id,
                email: body.email,
                role: body.role,
            };
            
            const token = this.authService['jwtService'].sign(payload);
            
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
                maxAge: 3600000, // 1 hora
                path: '/'
            });
            
            return res.json({ message: 'Test token generated', token });
        } catch (error) {
            throw new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
