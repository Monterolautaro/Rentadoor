import { Injectable } from "@nestjs/common";
import { SupabaseService } from "src/supabase/supabase.service";

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthRepository {
    constructor(private readonly supabase: SupabaseService) {}
    
    async login(loginDto: LoginDto) {
        const { data, error } = await this.supabase.getClient().auth.signInWithPassword({
            email: loginDto.email,
            password: loginDto.password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return {
            user: data.user,
            token: data.session?.access_token,
        };
    }
}