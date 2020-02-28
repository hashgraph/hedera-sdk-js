import { ContractLogInfo, contractLogInfoListToSdk } from "./ContractLogInfo";
import * as pb from "../generated/ContractCallLocal_pb";
import { ContractId } from "./ContractId";
import BigNumber from "bignumber.js";
import { encodeHex } from "../crypto/util";

/**
 * The result returned by a call to a smart contract function. This is part of the response to
 * a ContractCallLocal query, and is in the record for a ContractCall or ContractCreateInstance
 * transaction. The ContractCreateInstance transaction record has the results of the call to
 * the constructor.
 */
export class ContractFunctionResult {
    /**
     * The smart contract instance whose function was called.
     */
    public readonly contractId: ContractId | null;

    /**
     * Message In case there was an error during smart contract execution.
     */
    public readonly errorMessage: string;

    /**
     * Bloom filter for record
     */
    public readonly bloom: Uint8Array;

    /**
     * Units of gas used  to execute contract.
     */
    public readonly gasUsed: number;

    /**
     * The log info for events returned by the function.
     */
    public readonly logs: ContractLogInfo[];

    private readonly [ "bytes" ]: Uint8Array;

    // Constructor isn't part of the stable API
    public constructor(result: pb.ContractFunctionResult | Uint8Array) {
        if (result instanceof pb.ContractFunctionResult) {
            this.bytes = result.getContractcallresult_asU8();

            this.contractId = result.hasContractid() ?
                ContractId._fromProto(result.getContractid()!) :
                null;

            this.errorMessage = result.getErrormessage();
            this.bloom = result.getBloom_asU8();
            this.gasUsed = result.getGasused();
            this.logs = contractLogInfoListToSdk(result.getLoginfoList());
        } else {
            this.contractId = new ContractId(0);
            this.bytes = result as Uint8Array;
            this.errorMessage = "";
            this.bloom = new Uint8Array();
            this.gasUsed = 0;
            this.logs = [];
        }
    }

    public asBytes(): Uint8Array {
        return this.bytes;
    }

    public getString(index?: number): string {
        return Buffer.from(this.getBytes(index ?? 0)).toString("utf-8");
    }

    private getBytes(index: number): Uint8Array {
        // Len should never be larger than Number.MAX
        // index * 32 is the position of the lenth
        // (index + 1) * 32 onward to (index + 1) * 32 + len will be the elements of the array
        // Arrays in solidity cannot be longer than 1024:
        // https://solidity.readthedocs.io/en/v0.4.21/introduction-to-smart-contracts.html
        const offset = this.getInt32(index);
        const len = new DataView(
            this.bytes.buffer,
            this.bytes.byteOffset + offset + 28,
            4
        ).getInt32(0);

        return this.bytes.subarray(offset + 32, offset + 32 + len);
    }

    public getBytes32(index: number): Uint8Array {
        return this.bytes.subarray(index * 32, index * 32 + 32);
    }

    public getBool(index: number): boolean {
        return this.bytes[ index * 32 + 31 ] !== 0;
    }

    public getInt8(index: number): number {
        return this.bytes[ index * 32 + 31 ];
    }

    public getInt32(index: number): number {
        // .getUint32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        return new DataView(
            this.bytes.buffer,
            this.bytes.byteOffset + index * 32 + 28,
            4
        ).getInt32(0);
    }

    public getInt64(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this._getBytes32(index).subarray(24, 32)),
            16
        );
    }

    public getInt256(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this._getBytes32(index)),
            16
        );
    }

    public getUint8(index: number): number {
        return this.bytes[ index * 32 + 31 ];
    }

    public getUint32(index: number): number {
        // .getUint32() interprets as big-endian
        // Using DataView instead of Uint32Array because the latter interprets
        // using platform endianness which is little-endian on x86
        return new DataView(
            this.bytes.buffer,
            this.bytes.byteOffset + index * 32 + 28,
            4
        ).getUint32(0);
    }

    public getUint64(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this._getBytes32(index).subarray(24, 32)),
            16
        );
    }

    public getUint256(index: number): BigNumber {
        return new BigNumber(
            encodeHex(this._getBytes32(index)),
            16
        );
    }

    public getAddress(index: number): string {
        return Buffer.from(this.bytes.subarray(
            index * 32 + 12,
            index * 32 + 32
        )).toString("hex");
    }

    //
    //  NOT A STABLE API
    //
    public _getBytes32(index: number): Uint8Array {
        return this.bytes.subarray(
            index * 32,
            index * 32 + 32
        );
    }
}
