import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsRepository } from "./payments.repository";
import { PaymentsService } from "./payments.service";
import { EmailModule } from "src/email/email.module";
import { ReservationsModule } from "src/reservations/reservations.module";




@Module({
    imports: [EmailModule, ReservationsModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, PaymentsRepository],
    exports: [PaymentsService],
})
export class PaymentsModule {}