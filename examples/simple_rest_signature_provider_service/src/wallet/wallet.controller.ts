import { Controller, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { AccountId } from "@hashgraph/sdk";

@Controller("wallet")
export class WalletController {
    constructor(public readonly walletService: WalletService) {}

    @Post("/connect")
    connect() {
        const accountId = this.walletService.wallet.getAccountId();
        const accountKey = this.walletService.wallet.getAccountKey();
        const network: Record<string, AccountId | string> = this.walletService.wallet.getNetwork();
        const mirrorNetwork = this.walletService.wallet.getMirrorNetwork();
        const ledgerId = this.walletService.wallet.getLedgerId();

        const net: Record<string, string> = {};

        for (const key of Object.keys(network)) {
            net[key] = network[key].toString();
        }

        return {
            accountId: accountId.toString(),
            accountKey: accountKey.toString(),
            network: net,
            mirrorNetwork,
            ledgerId: ledgerId != null ? ledgerId.toString() : null,
        };
    }
}
