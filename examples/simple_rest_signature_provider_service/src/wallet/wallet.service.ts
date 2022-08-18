import { Injectable } from "@nestjs/common";
import { AccountId, PrivateKey, Wallet, LocalProvider, PrecheckStatusError, StatusErrorJSON } from "@hashgraph/sdk";
import { Executable } from "../../../../lib/LocalProvider";

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

    async call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<{ response?: string, error?: StatusErrorJSON | string }> {
        try {
            const response = await this.wallet.call(request);
            // TODO: We should not be calling private methods
            const serialized = request._serializeResponse(response);
            const hex = Buffer.from(serialized).toString("hex");
            return { response: hex };
        } catch (error) {
            if (error instanceof PrecheckStatusError) {
                return { error: error.toJSON() };
            } else {
                return { error: error.toString() };
            }
        }
    }
}
