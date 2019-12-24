import { ContractLogInfo, contractLogInfoListToSdk } from "./ContractLogInfo";
import * as pb from "../generated/ContractCallLocal_pb";
import { ContractId } from "./ContractId";
import BigNumber from "bignumber.js";
import { encodeHex } from "../crypto/util";

export class ContractFunctionResult {
    public readonly contractId: ContractId;
    public readonly errorMessage: string;
    public readonly bloom: Uint8Array;
    public readonly gasUsed: number;
    public readonly logs: ContractLogInfo[];

    private readonly _bytes: Uint8Array;

    // Constructor isn't part of the stable API
    public constructor(result: pb.ContractFunctionResult) {
        this._bytes = result.getContractcallresult_asU8();
        this.contractId = ContractId._fromProto(result.getContractid()!);
        this.errorMessage = result.getErrormessage();
        this.bloom = result.getBloom_asU8();
        this.gasUsed = result.getGasused();
        this.logs = contractLogInfoListToSdk(result.getLoginfoList());
    }

    public asBytes(): Uint8Array {
        return this._bytes;
    }

    public getString(index: number): string {
        return Buffer.from(this.getBytes(index)).toString("utf-8");
    }

    private getBytes(index: number): Uint8Array {
        // Len should never be larger than Number.MAX
        // index * 32 is the position of the lenth
        // (index + 1) * 32 onward to (index + 1) * 32 + len will be the elements of the array
        // Arrays in solidity cannot be longer than 1024:
        // https://solidity.readthedocs.io/en/v0.4.21/introduction-to-smart-contracts.html
        const len = this.getInt32(index);
        return this._bytes.subarray((index + 1) * 32, (index + 1) * 32 + len);
    }

    public getBool(index: number): boolean {
        return this._bytes[ index * 32 + 31 ] !== 0;
    }

    public getInt32(index: number): number {
        // .getUint32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        return new DataView(
            this._bytes.buffer,
            this._bytes.byteOffset,
            this._bytes.byteLength
        ).getInt32(index * 32 + 28);
    }

    public getInt64(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this.getBytes32(index).subarray(24, 32)),
            16
        );
    }

    public getInt256(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this.getBytes32(index)),
            16
        );
    }

    public getAddress(index: number): string {
        return Buffer.from(this._bytes.subarray(
            index * 32 + 12,
            index * 32 + 32
        )).toString("hex");
    }

    public getBytes32(index: number): Uint8Array {
        return this._bytes.subarray(
            index * 32,
            index * 32 + 32
        );
    }
}
