import { Controller, Post, Body, Logger, HttpCode, Res } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionDto } from "./transaction.dto";
import { Transaction } from "@hashgraph/sdk";
import { Response } from "express";

@Controller("transaction")
export class TransactionController {
    private readonly logger = new Logger(TransactionController.name);

    constructor(public readonly walletService: WalletService) {}

    @Post("/sign")
    @HttpCode(200)
    async sign(@Body() body: TransactionDto) {
        this.logger.debug(`/sign ${body.bytes}`);

        let transaction = Transaction.fromBytes(Buffer.from(body.bytes, "hex"));
        transaction = await this.walletService.wallet.signTransaction(
            transaction,
        );

        this.logger.debug(`/sign ${Buffer.from(transaction.toBytes()).toString("hex")}`);

        return {
            response: Buffer.from(transaction.toBytes()).toString("hex"),
        };
    }

    @Post("/execute")
    async execute(@Res() res: Response, @Body() body: TransactionDto) {
        this.logger.debug(`/execute ${body.bytes}`);

        const transaction = Transaction.fromBytes(
            Buffer.from(body.bytes, "hex"),
        );

        await this.walletService.call(body.bytes, res, transaction);
    }
}
