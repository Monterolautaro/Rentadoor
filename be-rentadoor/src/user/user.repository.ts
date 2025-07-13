import { Injectable } from "@nestjs/common";
import { IUser } from "./interfaces/user.interface";
import { SupabaseService } from "../supabase/supabase.service";



@Injectable()
export class UserRepository {
    constructor(private readonly supabase: SupabaseService) {}

    async getUserByEmail(email: string): Promise<IUser | null> {
        try {
            const { data, error } = await this.supabase.getClient()
                .from('Users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !data) {
                return null;
            }

            return data as IUser;
        } catch (error) {
            return null;
        }
    }
}
