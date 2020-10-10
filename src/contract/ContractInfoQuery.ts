import { QueryBuilder } from "../QueryBuilder";
import { ContractGetInfoQuery } from "../generated/ContractGetInfo_pb";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { ContractId, ContractIdLike } from "./ContractId";
import { AccountId } from "../account/AccountId";
import { timestampToDate } from "../Timestamp";
import { ResponseHeader } from "../generated/ResponseHeader_pb";
import { PublicKey, _fromProtoKey } from "../crypto/PublicKey";
import { BaseClient } from "../BaseClient";
import { Hbar } from "../Hbar";

/**
 * Response when the client sends the node ContractGetInfoQuery
 */
export interface ContractInfo {
    /**
     * ID of the contract instance, in the format used in transactions.
     */
    contractId: ContractId;

    /**
     * ID of the cryptocurrency account owned by the contract instance,
     * in the format used in transactions.
     */
    accountId: AccountId;

    /**
     * ID of both the contract instance and the cryptocurrency account owned by the contract
     * instance, in the format used by Solidity.
     */
    contractAccountId: string;

    /**
     * The state of the instance and its fields can be modified arbitrarily if this key signs a
     * transaction to modify it. If this is null, then such modifications are not possible,
     * and there is no administrator that can override the normal operation of this smart
     * contract instance. Note that if it is created with no admin keys, then there is no
     * administrator to authorize changing the admin keys, so there can never be any admin keys
     * for that instance.
     */
    adminKey: PublicKey | null;

    /**
     * The current time at which this contract instance (and its account) is set to expire.
     */
    expirationTime: Date;

    /**
     * The expiration time will extend every this many seconds. If there are insufficient funds,
     * then it extends as long as possible. If the account is empty when it expires,
     * then it is deleted.
     */
    autoRenewPeriod: number;

    /**
     * Number of bytes of storage being used by this instance (which affects the cost to
     * extend the expiration time).
     */
    storage: number;

    /**
     * The memo associated with the contract (max 100 bytes).
     */
    contractMemo: string;
}

/**
 * Get information about a smart contract instance. This includes the account that it uses, the
 * file containing its bytecode, and the time when it will expire.
 */
export class ContractInfoQuery extends QueryBuilder<ContractInfo> {
    private readonly _builder: ContractGetInfoQuery;
    public constructor() {
        super();

        this._builder = new ContractGetInfoQuery();
        this._builder.setHeader(new QueryHeader());

        this._inner.setContractgetinfo(this._builder);
    }

    /**
     * The contract for which information is requested.
     */
    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(new ContractId(contractIdLike)._toProto());
        return this;
    }

    /**
     * Wrapper around `QueryBuilder.getCost()`. This must exist because the cost returned
     * `QueryBuilder.getCost()` and therein the Hedera Network doesn't work for any
     * contracts that have been deleted. In that case we want the minimum
     * cost to be ~25 Tinybar as this seems to succeed most of the time.
     */
    public async getCost(client: BaseClient): Promise<Hbar> {
        // deleted contracts return a COST_ANSWER of zero which triggers `INSUFFICIENT_TX_FEE`
        // if you set that as the query payment; 25 tinybar seems to be the minimum to get
        // `CONTRACT_DELETED` back instead.
        const min = Hbar.fromTinybar(25);
        const cost = await super.getCost(client);
        return cost.isGreaterThan(min) ? cost : min;
    }

    protected _doLocalValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected _getMethod(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getContractInfo;
    }

    protected _getHeader(): QueryHeader {
        return this._builder.getHeader()!;
    }

    protected _mapResponseHeader(response: Response): ResponseHeader {
        return response.getContractgetinfo()!.getHeader()!;
    }

    protected _mapResponse(response: Response): ContractInfo {
        const contractInfo = response.getContractgetinfo()!.getContractinfo()!;

        return {
            contractId: ContractId._fromProto(contractInfo.getContractid()!),
            accountId: AccountId._fromProto(contractInfo.getAccountid()!),
            contractAccountId: contractInfo.getContractaccountid(),

            adminKey: contractInfo.hasAdminkey() ?
                _fromProtoKey(contractInfo.getAdminkey()!) :
                null,

            expirationTime: timestampToDate(contractInfo.getExpirationtime()!),
            autoRenewPeriod: contractInfo.getAutorenewperiod()!.getSeconds(),
            storage: contractInfo.getStorage(),
            contractMemo: contractInfo.getMemo()
        };
    }
}
