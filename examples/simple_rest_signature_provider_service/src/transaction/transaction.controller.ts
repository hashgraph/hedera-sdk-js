import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionDto } from "./transaction.dto";
import { Transaction } from "@hashgraph/sdk";

@Controller("transaction")
export class TransactionController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/sign")
    @HttpCode(200)
    async sign(@Body() body: TransactionDto) {
        let transaction = Transaction.fromBytes(Buffer.from(body.bytes, "hex"));
        transaction = await this.walletService.wallet.signTransaction(
            transaction,
        );
        return Buffer.from(transaction.toBytes()).toString("hex");
    }

    @Post("/execute")
    @HttpCode(200)
    async execute(@Body() body: TransactionDto) {
        const transaction = Transaction.fromBytes(
            Buffer.from(body.bytes, "hex"),
        );
        return this.walletService.wallet.call(transaction);
    }
}
