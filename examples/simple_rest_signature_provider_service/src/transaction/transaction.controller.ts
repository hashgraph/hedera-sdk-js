import { Controller, Post, Body, HttpCode, Res } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionDto } from "./transaction.dto";
import { Transaction } from "@hashgraph/sdk";
import { Response } from "express";

@Controller("transaction")
export class TransactionController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/sign")
    @HttpCode(200)
    async sign(@Body() body: TransactionDto) {
        let transaction = Transaction.fromBytes(
            Buffer.from(body.bytes, "hex"),
        );
        transaction = await this.walletService.wallet.signTransaction(
            transaction,
        );
        return {
            response: Buffer.from(transaction.toBytes()).toString("hex"),
        };
    }

    @Post("/execute")
    async execute(@Res() res: Response, @Body() body: TransactionDto) {
        const transaction = Transaction.fromBytes(
            Buffer.from(body.bytes, "hex"),
        );

        await this.walletService.call(res, transaction);
    }
}
