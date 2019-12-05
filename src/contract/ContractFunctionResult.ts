import { ContractLogInfo, contractLogInfoListToSdk } from "./ContractLogInfo";
import { ContractFunctionResult as ProtoContractFunctionResult } from "../generated/ContractCallLocal_pb";
import { ContractId, ContractIdLike } from "./ContractId";
import BigNumber from "bignumber.js";
import { encodeHex } from "../crypto/util";

export class ContractFunctionResult {
    public readonly contractId: ContractId;
    public readonly contractCallResult: Uint8Array;
    public readonly errorMessage: string;
    public readonly bloom: Uint8Array;
    public readonly gasUsed: number;
    public readonly logInfoList: ContractLogInfo[];

    // Constructor isn't part of the stable API
    public constructor(
        contractId: ContractIdLike,
        contractCallResult: Uint8Array,
        errorMessage: string,
        bloom: Uint8Array,
        gasUsed: number,
        logInfoList: ContractLogInfo[]
    ) {
        this.contractId = new ContractId(contractId);
        this.contractCallResult = contractCallResult;
        this.errorMessage = errorMessage;
        this.bloom = bloom;
        this.gasUsed = gasUsed;
        this.logInfoList = logInfoList;
    }

    public getString(index: number): string {
        return Buffer.from(this.getBytes(index)).toString("utf-8");
    }

    public getBytes(index: number): Uint8Array {
        // Len should never be larger than Number.MAX
        // index * 32 is the position of the lenth
        // (index + 1) * 32 onward to (index + 1) * 32 + (len * 32) will be the elements of the array
        // Arrays in solidity cannot be longer than 1024:
        // https://solidity.readthedocs.io/en/v0.4.21/introduction-to-smart-contracts.html
        const len = this.getUint32(index);
        return this.contractCallResult.subarray((index + 1) * 32, (index + 1) * 32 + len * 32);
    }

    public getBigNumber(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this.getBytes32(index)),
            16
        );
    }

    public getBytes32(index: number): Uint8Array {
        return this.contractCallResult.subarray(
            index * 32,
            index * 32 + 32
        );
    }

    public getUint32(index: number): number {
        // .getUint32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        return new DataView(
            this.contractCallResult.buffer,
            this.contractCallResult.byteOffset,
            this.contractCallResult.byteLength
        ).getUint32(index * 32 + 28);
    }

    public getBool(index: number): boolean {
        return this.contractCallResult[ index * 32 + 31 ] !== 0;
    }

    public getAddress(index: number): Uint8Array {
        return this.contractCallResult.subarray(
            index * 32 + 12,
            index * 32 + 32
        );
    }
}

/* eslint-disable-next-line max-len */
export function contractFunctionResultToSdk(result: ProtoContractFunctionResult): ContractFunctionResult {
    return new ContractFunctionResult(
        ContractId.fromProto(result.getContractid()!),
        result.getContractcallresult_asU8(),
        result.getErrormessage(),
        result.getBloom_asU8(),
        result.getGasused(),
        contractLogInfoListToSdk(result.getLoginfoList())
    );
}
