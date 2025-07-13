import { Module } from "@nestjs/common";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";
import { StorageRepository } from "./storage.repository";
import { EncryptionModule } from "../encryption/encryption.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { EncryptionService } from "../encryption/encryption.service";



@Module({
    imports: [SupabaseModule, EncryptionModule],
    controllers: [StorageController],
    providers: [StorageService, StorageRepository, EncryptionService]
})
export class StorageModule{}