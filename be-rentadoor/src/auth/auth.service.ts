import { Injectable, BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { AuthRepository } from "./auth.repository";
import { LoginDto } from "../dtos/login.dto";
import { SignUpDto } from "../dtos/signup.dto";
import * as bcrypt from 'bcrypt';
import { Roles } from "../common/enums/roles.enum";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
    constructor(
      private readonly authRepository: AuthRepository,
      private readonly jwtService: JwtService,
      private readonly emailService: EmailService
    ) {}
    
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new BadRequestException('Email and password are required');
        }

        const result = await this.authRepository.login(loginDto);
        
        
        if (!result) {
            throw new NotFoundException('User not found');
        }
        
        const isPasswordValid = await bcrypt.compare(password, result.contraseña);
      
        
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
          id: result.id,
          email,
          role: Roles.USER,
        };

        const token = this.jwtService.sign(payload);

        return {
            success: 200,
            token: token,
            user: {
                id: result.id,
                name: result.nombre,
                email: result.email,
                phone: result.telefono,
                role: result.rol,
                isEmailVerified: result.isEmailVerified,
                identityVerificationStatus: result.identityVerificationStatus || 'not_verified'
            }
        };
    }

    async signUp(signUpDto: SignUpDto) {
        const { email, name, telephone, password } = signUpDto;
        
        
        if (!email || !name || !telephone || !password) {
            throw new BadRequestException('All fields are required');
        }
        

        const result = await this.authRepository.signUp(signUpDto);
        
        if (!result) {
            throw new ConflictException('User already exists or error creating user');
        }

        // Obtener el usuario creado para generar el token
        const createdUser = await this.authRepository.login({ email, password });
        
        if (!createdUser) {
            throw new BadRequestException('User created but could not retrieve data');
        }

        const payload = {
            id: createdUser.id,
            email,
            role: Roles.USER,
        };

        const token = this.jwtService.sign(payload);
        
        // Enviar email de verificación
        try {
            const verificationToken = this.jwtService.sign(
                { email, type: 'email_verification' },
                { expiresIn: '24h' }
            );

            const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
            
            await this.emailService.sendMail(
                email,
                'Verificar Email - Rentadoor',
                `Hola ${createdUser.nombre},\n\nGracias por registrarte en Rentadoor. Por favor verifica tu email haciendo click en el siguiente enlace: ${verificationLink}`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">Verificar Email - Rentadoor</h2>
                    <p>Hola <strong>${createdUser.nombre}</strong>,</p>
                    <p>Gracias por registrarte en Rentadoor. Por favor verifica tu email haciendo click en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
                    </div>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b;">Saludos,<br>Equipo de Rentadoor</p>
                </div>
                `
            );
        } catch (error) {
            console.error('Error sending verification email:', error);
        }
        
        return {
            success: "User created successfully",
            token: token,
            user: {
                id: createdUser.id,
                name: createdUser.nombre,
                email: createdUser.email,
                phone: createdUser.telefono,
                role: createdUser.rol,
                isEmailVerified: createdUser.isEmailVerified
            }
        };
    }

    async logout() {
        return {
            success: 200,
            message: "User logged out successfully"
        };
    }

    async getCurrentUser(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            const user = await this.authRepository.getUserById(payload.id);
            
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return {
                id: user.id,
                name: user.nombre,
                email: user.email,
                phone: user.telefono,
                role: user.rol,
                isEmailVerified: user.isEmailVerified,
                identityVerificationStatus: user.identityVerificationStatus || 'not_verified'
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async forgotPassword(email: string) {
        if (!email) {
            throw new BadRequestException('Email is required');
        }

        const user = await this.authRepository.getUserByEmail(email);
        
        if (!user) {
            return {
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            };
        }

        const resetToken = this.jwtService.sign(
            { email, type: 'password_reset' },
            { expiresIn: '1h' }
        );

        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            
            await this.emailService.sendMail(
                email,
                'Recuperar Contraseña - Rentadoor',
                `Hola ${user.nombre},\n\nHas solicitado restablecer tu contraseña. Haz click en el siguiente enlace para continuar: ${resetLink} Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este email. Saludos, Equipo de Rentadoor`,
                `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1e293b;">Recuperar Contraseña - Rentadoor</h2>
                    <p>Hola <strong>${user.nombre}</strong>,</p>
                    <p>Has solicitado restablecer tu contraseña. Haz click en el siguiente botón para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
                    </div>
                    <p style="font-size: 14px; color: #64748b;">Este enlace expira en 1 hora.</p>
                    <p style="font-size: 14px; color: #64748b;">Si no solicitaste este cambio, puedes ignorar este email.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 14px; color: #64748b;">Saludos,<br>Equipo de Rentadoor</p>
                </div>
                `
            );

            return {
                success: 201,
                message: 'If the email exists, a password reset link has been sent.'
            };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return {
                success: true,
                message: 'If the email exists, a password reset link has been sent.'
            };
        }
    }

    async verifyResetToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            
            if (payload.type !== 'password_reset') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.authRepository.getUserByEmail(payload.email);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            return {
                success: true,
                message: 'Token is valid'
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async resetPassword(token: string, newPassword: string) {
        try {
            const payload = this.jwtService.verify(token);
            
            if (payload.type !== 'password_reset') {
                throw new UnauthorizedException('Invalid token type');
            }

            // Verificar si el usuario existe
            const user = await this.authRepository.getUserByEmail(payload.email);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña en la base de datos
            const result = await this.authRepository.updatePassword(user.id, hashedPassword);
            
            if (!result) {
                throw new BadRequestException('Error updating password');
            }

            return {
                success: true,
                message: 'Password updated successfully'
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Invalid or expired token');
        }
    }

    async verifyEmail(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            
            if (payload.type !== 'email_verification') {
                throw new UnauthorizedException('Invalid token type');
            }

            const user = await this.authRepository.getUserByEmail(payload.email);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Actualizar isEmailVerified a true
            const result = await this.authRepository.updateEmailVerification(user.id, true);
            
            if (!result) {
                throw new BadRequestException('Error updating email verification');
            }

            return {
                success: true,
                message: 'Email verified successfully'
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Invalid or expired token');
        }
    }

    async resendVerification(email: string) {
        try {
            const user = await this.authRepository.getUserByEmail(email);
            
            if (!user) {
                return {
                    success: true,
                    message: 'If the email exists, a verification link has been sent.'
                };
            }

            if (user.isEmailVerified) {
                return {
                    success: true,
                    message: 'Email is already verified.'
                };
            }

            const verificationToken = this.jwtService.sign(
                { email, type: 'email_verification' },
                { expiresIn: '24h' }
            );

            try {
                const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
                
                await this.emailService.sendMail(
                    email,
                    'Verificar Email - Rentadoor',
                    `Hola ${user.nombre},\n\nPor favor verifica tu email haciendo click en el siguiente enlace: ${verificationLink}`,
                    `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1e293b;">Verificar Email - Rentadoor</h2>
                        <p>Hola <strong>${user.nombre}</strong>,</p>
                        <p>Por favor verifica tu email haciendo click en el siguiente botón:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationLink}" style="background-color: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar Email</a>
                        </div>
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
                        <p style="font-size: 14px; color: #64748b;">Saludos,<br>Equipo de Rentadoor</p>
                    </div>
                    `
                );

                return {
                    success: true,
                    message: 'Verification email sent successfully'
                };
            } catch (error) {
                console.error('Error sending verification email:', error);
                return {
                    success: true,
                    message: 'If the email exists, a verification link has been sent.'
                };
            }
        } catch (error) {
            throw new BadRequestException('Error sending verification email');
        }
    }

    async approveIdentityVerification(userId: string) {
        try {
            const result = await this.authRepository.approveIdentityVerification(userId);
            
            if (!result) {
                throw new BadRequestException('Error approving identity verification');
            }

            return {
                success: true,
                message: 'Identity verification approved successfully'
            };
        } catch (error) {
            throw new BadRequestException('Error approving identity verification');
        }
    }

    async rejectIdentityVerification(userId: string) {
        try {
            const result = await this.authRepository.rejectIdentityVerification(userId);
            
            if (!result) {
                throw new BadRequestException('Error rejecting identity verification');
            }

            return {
                success: true,
                message: 'Identity verification rejected successfully'
            };
        } catch (error) {
            throw new BadRequestException('Error rejecting identity verification');
        }
    }
}