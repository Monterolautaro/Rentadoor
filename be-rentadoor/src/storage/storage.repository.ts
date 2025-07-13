import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorageRepository {
    constructor(private readonly supabaseService: SupabaseService) {}

    async uploadToSupabase(storagePath: string, data: Buffer) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.storage
            .from('encrypted')
            .upload(storagePath, data);

        if (error) throw new Error(`Supabase upload failed: ${error.message}`);
    }

    async insertMetadata(record: any) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('encrypted_files')
            .insert(record)
            .select('*')
            .single();

        if (error) throw new Error(`DB insert failed: ${error.message}`);
        return data;
    }

    async fetchFiles(userId?: string) {
        const supabase = this.supabaseService.getClient();
        let query = supabase.from('encrypted_files').select('*');
        if (userId) query = query.eq('user_id', userId);

        const { data, error } = await query;
        if (error) throw new Error(`Fetch failed: ${error.message}`);
        return data;
    }

    async fetchFileById(fileId: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('encrypted_files')
            .select('*')
            .eq('id', fileId)
            .single();

        if (error) throw new Error(`Fetch file by ID failed: ${error.message}`);
        return data;
    }

    async downloadFromSupabase(storagePath: string) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase.storage
            .from('encrypted')
            .download(storagePath);

        if (error) throw new Error(`Download failed: ${error.message}`);
        return Buffer.from(await data.arrayBuffer());
    }

    async uploadPropertyImageToSupabase(storagePath: string, data: Buffer) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.storage
            .from('properties')
            .upload(storagePath, data);

        if (error) throw new Error(`Property image upload failed: ${error.message}`);
    }

    async getPublicUrl(storagePath: string): Promise<string> {
        const supabase = this.supabaseService.getClient();
        const { data } = supabase.storage
            .from('properties')
            .getPublicUrl(storagePath);

        return data.publicUrl;
    }

    async deleteFromSupabase(storagePath: string) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.storage
            .from('properties')
            .remove([storagePath]);

        if (error) throw new Error(`Delete failed: ${error.message}`);
    }
}
