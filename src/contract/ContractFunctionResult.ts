import { ContractLogInfo, contractLogInfoListToSdk } from "./ContractLogInfo";
import { ContractFunctionResult as ProtoContractFunctionResult } from "../generated/ContractCallLocal_pb";
import { ContractId, contractIdToSdk } from "./ContractId";
import BigNumber from "bignumber.js";

export class ContractFunctionResult {
    public readonly contractId: ContractId;
    public readonly contractCallResult: Uint8Array;
    public readonly errorMessage: string;
    public readonly bloom: Uint8Array;
    public readonly gasUsed: number;
    public readonly logInfoList: ContractLogInfo[];

    // Constructor isn't part of the stable API
    public constructor(
        contractId: ContractId,
        contractCallResult: Uint8Array,
        errorMessage: string,
        bloom: Uint8Array,
        gasUsed: number,
        logInfoList: ContractLogInfo[]
    ) {
        this.contractId = contractId;
        this.contractCallResult = contractCallResult;
        this.errorMessage = errorMessage;
        this.bloom = bloom;
        this.gasUsed = gasUsed;
        this.logInfoList = logInfoList;
    }

    public getString(index?: number): string {
        return String(this.getBytes(index == null ? 0 : index));
    }

    public getBytes(index: number): Uint8Array {
        // Len should never be larger than Number.MAX
        // index * 32 is the position of the lenth
        // index * 33 onward to index * 33 + (len * 32) will be the elements of the array
        // Arrays in solidity cannot be longer than 1024:
        // https://solidity.readthedocs.io/en/v0.4.21/introduction-to-smart-contracts.html
        const len = this.getNumber(index);
        return this.contractCallResult.slice((index * 33), (index * 33) + (len * 32));
    }

    public getBigNumber(index?: number): BigNumber {
        let num = new BigNumber(0);
        num = num.plus(
            Buffer.from(this.contractCallResult.slice(
                ((index == null ? 0 : index) * 32),
                ((index == null ? 0 : index) * 32) + 32
            )).toString("hex"),
            16
        );
        return num;
    }

    public getNumber(index?: number): number {
        let num = new BigNumber(0);
        // Number is stored as 53 bits in a 64 bit floating point number
        num = num.plus(
            Buffer.from(this.contractCallResult.slice(
                ((index == null ? 0 : index) * 32) + 24,
                ((index == null ? 0 : index) * 33) + 32
            )).toString("hex"),
            16
        );
        return num.toNumber();
    }

    public getBool(index?: number): boolean {
        return this.contractCallResult[ ((index == null ? 0 : index) * 32) + 31 ] !== 0;
    }

    public getAddress(index?: number): Uint8Array {
        return this.contractCallResult.slice(
            (index == null ? 0 : index * 32) + 12,
            ((index == null ? 0 : index) * 32) + 32
        );
    }
}

/* eslint-disable-next-line max-len */
export function contractFunctionResultToSdk(result: ProtoContractFunctionResult): ContractFunctionResult {
    return new ContractFunctionResult(
        contractIdToSdk(result.getContractid()!),
        result.getContractcallresult_asU8(),
        result.getErrormessage(),
        result.getBloom_asU8(),
        result.getGasused(),
        contractLogInfoListToSdk(result.getLoginfoList())
    );
}
