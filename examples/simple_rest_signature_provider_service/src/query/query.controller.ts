import { Controller, Post, Body, Res } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { QueryDto } from "./query.dto";
import { Query } from "@hashgraph/sdk";
import { Response } from "express";

@Controller("query")
export class QueryController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/execute")
    async execute(
        @Res({ passthrough: true }) res: Response,
        @Body() body: QueryDto,
    ) {
        const query = Query.fromBytes(Buffer.from(body.bytes, "hex"));
        await this.walletService.call(body.bytes, res, query);
    }
}
