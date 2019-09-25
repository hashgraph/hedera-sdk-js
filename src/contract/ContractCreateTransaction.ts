import {TransactionBuilder} from "../TransactionBuilder";
import {Transaction} from "../generated/Transaction_pb";
import {TransactionResponse} from "../generated/TransactionResponse_pb";
import {grpc} from "@improbable-eng/grpc-web";
import {BaseClient} from "../BaseClient";
import {ContractCreateTransactionBody} from "../generated/ContractCreate_pb";
import {getProtoAccountId, getProtoFileId, newDuration, tinybarToString} from "../util";
import BigNumber from "bignumber.js";
import {SmartContractService} from "../generated/SmartContractService_pb_service";

import {AccountId, FileIdLike, Tinybar} from "../typedefs";
import {Hbar} from "../Hbar";
import {PublicKey} from "../Keys";

export class ContractCreateTransaction extends TransactionBuilder {
    private readonly _body: ContractCreateTransactionBody;

    public constructor(client: BaseClient) {
        super(client);
        this._body = new ContractCreateTransactionBody();
        this._inner.setContractcreateinstance(this._body);
    }

    protected _doValidate(errors: string[]): void {
        const fileId = this._body.getFileid()!;

        if (fileId == null) {
            errors.push('ContractCreateTransaction must have BytecodeFile set');
            return;
        }
    }

    public setBytecodeFile(fileIdLike: FileIdLike): this {
        this._body.setFileid(getProtoFileId(fileIdLike));
        return this;
    }

    public setAdminkey(publicKey: PublicKey): this {
        this._body.setAdminkey(publicKey._toProtoKey());
        return this;
    }

    public setGas(gas: number | BigNumber): this {
        this._body.setGas(String(gas));
        return this;
    }

    public setInitialBalance(intialBalance: Tinybar | Hbar): this {
        this._body.setInitialbalance(tinybarToString(intialBalance));
        return this;
    }

    public setProxyAccountId(proxyAccountId: AccountId): this {
        this._body.setProxyaccountid(getProtoAccountId(proxyAccountId));
        return this;
    }

    public setAutoRenewPeriod(seconds: number): this {
        this._body.setAutorenewperiod(newDuration(seconds));
        return this;
    }

    public setConstructorParams(constructorParams: Uint8Array | string): this {
        this._body.setConstructorparameters(constructorParams);
        return this;
    }

    public get _method(): grpc.UnaryMethodDefinition<Transaction, TransactionResponse> {
        return SmartContractService.createContract;
    }
}
