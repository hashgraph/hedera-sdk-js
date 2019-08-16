import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {CryptoCreateTransactionBody} from "../generated/CryptoCreate_pb";
import {Client} from "../Client";
import {newDuration} from "../util";
import {Key} from "../generated/BasicTypes_pb";

export class AccountCreateTransaction extends TransactionBuilder {
    private body: CryptoCreateTransactionBody;

    constructor(client: Client) {
        super(client);
        const body = new CryptoCreateTransactionBody();
        this.body = body;
        this.inner.setCryptocreateaccount(body);

        // 30 days, default recommended
        this.setAutoRenewPeriod(30 * 86400);
        // Default to maximum values for record thresholds. Without this records would be
        // auto-created whenever a send or receive transaction takes place for this new account. This should
        // be an explicit ask.
        body.setReceiverecordthreshold(Number.MAX_SAFE_INTEGER);
        body.setSendrecordthreshold(Number.MAX_SAFE_INTEGER);
    }

    setKey(publicKey: Uint8Array): this {
        const protoKey = new Key();
        protoKey.setEd25519(publicKey);
        this.body.setKey(protoKey);
        return this;
    }

    setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    setInitialBalance(balance: number | BigInt): this {

    }

    get method(): grpc.MethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.createAccount;
    }
}
