import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { WalletService } from "../wallet/wallet.service";
import { QueryDto } from "./query.dto";
import { Query } from "@hashgraph/sdk";

@Controller("query")
export class QueryController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/execute")
    @HttpCode(200)
    async execute(@Body() body: QueryDto) {
        const query = Query.fromBytes(Buffer.from(body.bytes, "hex"));
        return this.walletService.wallet.call(query);
    }
}
