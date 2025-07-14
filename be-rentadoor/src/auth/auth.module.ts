import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Module } from "@nestjs/common";
import { UserRepository } from "../user/user.repository";
import { EmailService } from "../email/email.service";
import { SupabaseService } from "../supabase/supabase.service";
import { UserModule } from "../user/user.module";
import { EmailModule } from "../email/email.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { RolesGuard } from "./guards/roles.guard";

@Module({
    imports: [
        UserModule,
        EmailModule,
        SupabaseModule
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, UserRepository, EmailService, SupabaseService, RolesGuard],
    exports: [AuthRepository, AuthService]
})
export class AuthModule {}