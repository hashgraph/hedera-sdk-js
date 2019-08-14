import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {CryptoService} from "../generated/CryptoService_pb_service";
import {CryptoCreateTransactionBody} from "../generated/CryptoCreate_pb";
import {Client} from "../Client";

export class AccountCreateTransaction extends TransactionBuilder {
    private body: CryptoCreateTransactionBody;

    constructor(client: Client) {
        super(client);
        this.body = this.inner.getCryptocreateaccount();
    }

    get method(): grpc.MethodDefinition<Transaction, TransactionResponse> {
        return CryptoService.createAccount;
    }
}
