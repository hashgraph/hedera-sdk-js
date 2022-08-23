import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TransactionModule } from "./transaction/transaction.module";
import { QueryModule } from "./query/query.module";
import { WalletModule } from "./wallet/wallet.module";

@Module({
    imports: [TransactionModule, QueryModule, WalletModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
