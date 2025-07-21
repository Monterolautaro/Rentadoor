import { Injectable } from "@nestjs/common";
import { LoginDto } from "../dtos/login.dto";
import { SignUpDto } from "../dtos/signup.dto";
import { UserRepository } from "../user/user.repository";
import { SupabaseService } from "../supabase/supabase.service";
import { Roles } from "../common/enums/roles.enum";
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly supabase: SupabaseService
    ) {}

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto

        if (!email || !password) return null;
        
        const foundUser = await this.userRepository.getUserByEmail(email)

        if(!foundUser) return null;

        return foundUser;
    }

    async signUp(user: SignUpDto) {
        const { email, name, telephone, password } = user;

        if(!email || !name || !telephone || !password) return null;

        const existingUser = await this.userRepository.getUserByEmail(email);
        if (existingUser) return null;

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const { error } = await this.supabase.getClient()
                .from('Users')
                .insert({
                    nombre: name,
                    email: email,
                    contraseña: hashedPassword,
                    telefono: telephone,
                    rol: Roles.USER,
                    isEmailVerified: false,
                    identityVerificationStatus: 'not_verified',
                    isDeleted: false,
                    isSuspended: false
                })

            if(error) return null;

            return { status: 201, message: 'user created successfully'}
        } catch (error) {
            return null;
        }
    }

    async getUserById(id: number) {
        try {
            const { data, error } = await this.supabase.getClient()
                .from('Users')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    }

    async getUserByEmail(email: string) {
        try {
            const { data, error } = await this.supabase.getClient()
                .from('Users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                return null;
            }

            return data;
        } catch (error) {
            return null;
        }
    }

    async updatePassword(userId: number, hashedPassword: string) {
        try {
            const { error } = await this.supabase.getClient()
                .from('Users')
                .update({ contraseña: hashedPassword })
                .eq('id', userId);

            if (error) {
                return null;
            }

            return { success: true };
        } catch (error) {
            return null;
        }
    }

    async updateEmailVerification(userId: number, isEmailVerified: boolean) {
        try {
            const { error } = await this.supabase.getClient()
                .from('Users')
                .update({ isEmailVerified })
                .eq('id', userId);

            if (error) {
                return null;
            }

            return { success: true };
        } catch (error) {
            return null;
        }
    }

    async updateIdentityVerificationStatus(userId: string, status: string) {
        try {
            
            const { error } = await this.supabase.getClient()
                .from('Users')
                .update({ identityVerificationStatus: status })
                .eq('id', userId);

            if (error) {
                return null;
            }

            return { success: true };
        } catch (error) {
            return null;
        }
    }

    async approveIdentityVerification(userId: string) {
        return this.updateIdentityVerificationStatus(userId, 'verified');
    }

    async rejectIdentityVerification(userId: string) {
        return this.updateIdentityVerificationStatus(userId, 'rejected');
    }
}