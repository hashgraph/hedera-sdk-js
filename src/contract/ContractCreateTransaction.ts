import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {ContractCreateTransactionBody} from "../generated/ContractCreate_pb";
import {accountIdToProto, tinybarToString, newDuration, fileIdToProto} from "../util";
import BigNumber from "bignumber.js";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {Tinybar} from "../types/Tinybar";
import {Hbar} from "../Hbar";
import {PublicKey} from "../Keys";
import {FileIdLike} from "../types/FileId";
import {AccountId} from "../types/AccountId";

export class ContractCreateTransaction extends TransactionBuilder {
    private readonly body: ContractCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this.body = new ContractCreateTransactionBody();
        this.inner.setContractcreateinstance(this.body);
    }

    protected doValidate(errors: string[]): void {
        if (!this.body.hasFileid()) {
            errors.push(".setBytecodeFile() required");
        }
    }

    public setBytecodeFile(fileIdLike: FileIdLike): this {
        this.body.setFileid(fileIdToProto(fileIdLike));
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this.body.setAdminkey(publicKey.toProtoKey());
        return this;
    }

    public setGas(gas: number | BigNumber): this {
        this.body.setGas(String(gas));
        return this;
    }

    public setInitialBalance(intialBalance: Tinybar | Hbar): this {
        this.body.setInitialbalance(tinybarToString(intialBalance));
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this.body.setProxyaccountid(accountIdToProto(proxyAccountId));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this.body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setConstructorParams(constructorParams: Uint8Array | string): this {
        this.body.setConstructorparameters(constructorParams);
        return this;
    }

    public get method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.createContract;
    }
}
