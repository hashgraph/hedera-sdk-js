import { Controller, Post, Body, HttpStatus, Res } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { QueryDto } from "./query.dto";
import { Query } from "@hashgraph/sdk";
import { Response } from "express";

@Controller("query")
export class QueryController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/execute")
    async execute(@Res() res: Response, @Body() body: QueryDto) {
        try {
            const query = Query.fromBytes(Buffer.from(body.bytes, "hex"));
            await this.walletService.call(res, query);
        } catch (error) {
            res.status(HttpStatus.OK).send({ error: error.toString() });
        }
    }
}
