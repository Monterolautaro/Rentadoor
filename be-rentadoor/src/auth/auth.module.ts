import { SupabaseModule } from "src/supabase/supabase.module";
import { AuthRepository } from "./auth.repository";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Module } from "@nestjs/common";




@Module({
    imports: [
        SupabaseModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, AuthRepository],
})
export class AuthModule {}