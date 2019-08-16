import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {CryptoCreateTransactionBody} from "../generated/CryptoCreate_pb";
import {Client} from "../Client";
import {checkNumber, newDuration} from "../util";
import {Key} from "../generated/BasicTypes_pb";
import UnaryMethodDefinition = grpc.UnaryMethodDefinition;

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
        // auto-created whenever a send or receive transaction takes place for this new account.
        // This should be an explicit ask.
        this.setReceiveRecordThreshold(Number.MAX_SAFE_INTEGER);
        this.setSendRecordThreshold(Number.MAX_SAFE_INTEGER);
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
        checkNumber(balance);
        this.body.setInitialbalance(String(balance));
        return this;
    }

    setReceiveRecordThreshold(threshold: number): this {
        checkNumber(threshold);
        this.body.setReceiverecordthreshold(threshold);
        return this;
    }

    setSendRecordThreshold(threshold: number): this {
        checkNumber(threshold);
        this.body.setSendrecordthreshold(threshold);
        return this;
    }

    get method(): UnaryMethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.createAccount;
    }

    doValidate(): void {
        if (!this.body.hasKey()) {
            throw new Error('AccountCreateTransaction requires setKey()');
        }

        if (BigInt(this.body.getInitialbalance()) === BigInt(0)) {
            throw new Error('AccountCreateTransaction must have nonzero setInitialBalance')
        }
    }
}
