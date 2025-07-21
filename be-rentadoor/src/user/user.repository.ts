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
                .eq('isDeleted', false)
                .single();

            if (error || !data) {
                return null;
            }

            return data as IUser;
        } catch (error) {
            return null;
        }
    }

    async getUsers(): Promise<IUser[]> {
        const { data, error } = await this.supabase.getClient()
            .from('Users')
            .select('*')
            .eq('isDeleted', false);
        if (error) throw new Error(error.message);
        return data as IUser[];
    }

    async getUserById(id: number): Promise<IUser | null> {
        const { data, error } = await this.supabase.getClient()
            .from('Users')
            .select('*')
            .eq('id', id)
            .eq('isDeleted', false)
            .single();
        if (error || !data) return null;
        return data as IUser;
    }

    async updateUser(id: number, update: Partial<IUser>): Promise<IUser> {
        const { data, error } = await this.supabase.getClient()
            .from('Users')
            .update(update)
            .eq('id', id)
            .select('*')
            .single();
        if (error) throw new Error(error.message);
        return data as IUser;
    }

    async suspendUser(id: number, suspend: boolean): Promise<IUser> {
        return this.updateUser(id, { isSuspended: suspend } as any);
    }

    async deleteUser(id: number): Promise<IUser> {
        return this.updateUser(id, { isDeleted: true } as any);
    }
}
