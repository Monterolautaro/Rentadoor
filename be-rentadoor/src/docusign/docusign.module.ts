import { Module } from "@nestjs/common";
import { DocuSignController } from "./docusign.controller";
import { DocusignService } from "./docusign.service";
import { ContractsRepository } from '../contracts/contracts.repository';
import { SupabaseModule } from "src/supabase/supabase.module";
import { ContractsModule } from "src/contracts/contracts.module";


@Module({
    imports: [SupabaseModule, ContractsModule],
    controllers: [DocuSignController],
    providers: [DocusignService],
    exports: [],
})
export class DocuSignModule {}