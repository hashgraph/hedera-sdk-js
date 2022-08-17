import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TransactionModule } from "./transaction/transaction.module";
import { QueryModule } from "./query/query.module";

@Module({
    imports: [TransactionModule, QueryModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
