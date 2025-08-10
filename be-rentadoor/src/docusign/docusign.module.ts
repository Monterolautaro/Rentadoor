import { Module } from "@nestjs/common";
import { DocuSignController } from "./docusign.controller";
import { DocusignService } from "./docusign.service";
import { SupabaseModule } from "src/supabase/supabase.module";
import { ContractsModule } from "src/contracts/contracts.module";
import { EmailModule } from "src/email/email.module";


@Module({
    imports: [SupabaseModule, ContractsModule, EmailModule],
    controllers: [DocuSignController],
    providers: [DocusignService],
    exports: [],
})
export class DocuSignModule {}