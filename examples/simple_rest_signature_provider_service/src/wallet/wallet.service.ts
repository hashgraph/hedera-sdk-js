import { Injectable } from "@nestjs/common";
import { AccountId, PrivateKey, Wallet, LocalProvider } from "@hashgraph/sdk";

@Injectable()
export class WalletService {
    public wallet: Wallet;

    constructor() {
        // Question: Should we support `HEDREA_NETWORK=local`?
        const provider = new LocalProvider();
        provider._client.setNetwork({ "127.0.0.1:50211": "0.0.3" });
        provider._client.setMirrorNetwork(["127.0.0.1:5600"]);

        this.wallet = new Wallet(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY),
            provider,
        );
    }
}
