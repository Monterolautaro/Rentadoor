import { Module } from "@nestjs/common";
import { StorageController } from "./storage.controller";
import { StorageService } from "./storage.service";
import { StorageRepository } from "./storage.repository";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { EncryptionService } from "src/encryption/encryption.service";

@Module({
    imports: [SupabaseModule, AuthModule, UserModule],
    controllers: [StorageController],
    providers: [StorageService, StorageRepository, EncryptionService]
})
export class StorageModule{}