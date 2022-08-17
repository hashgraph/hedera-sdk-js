import { Module } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionController } from "./transaction.controller";

@Module({
    imports: [],
    controllers: [TransactionController],
    providers: [WalletService],
})
export class TransactionModule {}
