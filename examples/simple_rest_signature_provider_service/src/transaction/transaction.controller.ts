import { Controller, Post, Body, HttpStatus, Res } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { TransactionDto } from "./transaction.dto";
import { Transaction } from "@hashgraph/sdk";
import { Response } from "express";

@Controller("transaction")
export class TransactionController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/sign")
    async sign(@Res() res: Response, @Body() body: TransactionDto) {
        try {
            let transaction = Transaction.fromBytes(
                Buffer.from(body.bytes, "hex"),
            );
            transaction = await this.walletService.wallet.signTransaction(
                transaction,
            );
            res.status(HttpStatus.OK).send({
                response: Buffer.from(transaction.toBytes()).toString("hex"),
            });
        } catch (error) {
            res.status(HttpStatus.OK).send({ error: error.toString() });
        }
    }

    @Post("/execute")
    async execute(@Res() res: Response, @Body() body: TransactionDto) {
        try {
            const transaction = Transaction.fromBytes(
                Buffer.from(body.bytes, "hex"),
            );

            await this.walletService.call(res, transaction);
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST).send({ error: error.toString() });
        }
    }
}
