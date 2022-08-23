import { Module } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { QueryController } from "./query.controller";

@Module({
    controllers: [QueryController],
    providers: [WalletService],
})
export class QueryModule {}
