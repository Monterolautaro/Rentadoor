import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Module } from "@nestjs/common";
import { UserRepository } from "src/user/user.repository";
import { EmailService } from "src/email/email.service";
import { SupabaseService } from "src/supabase/supabase.service";
import { UserModule } from "src/user/user.module";
import { EmailModule } from "src/email/email.module";
import { SupabaseModule } from "src/supabase/supabase.module";

@Module({
    imports: [
        UserModule,
        EmailModule,
        SupabaseModule
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, UserRepository, EmailService, SupabaseService],
})
export class AuthModule {}