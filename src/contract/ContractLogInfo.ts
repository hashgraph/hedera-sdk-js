import { ContractLoginfo as ProtoContractLoginfo } from "../generated/ContractCallLocal_pb";
import { ContractId } from "./ContractId";

/**
 * The log information for an event returned by a smart contract function call. One function call
 * may return several such events.
 */
export interface ContractLogInfo {
    /**
     * Address of a contract that emitted the event.
     */
    contractId: ContractId;

    /**
     * Bloom filter for a particular log.
     */
    bloom: Uint8Array;

    /**
     * Topics of a particular event.
     */
    topics: Uint8Array[];

    /**
     * Event data.
     */
    data: Uint8Array;
}

export function contractLogInfoListToSdk(logInfoList: ProtoContractLoginfo[]): ContractLogInfo[] {
    return logInfoList.map((logInfo) => ({
        contractId: ContractId._fromProto(logInfo.getContractid()!),
        bloom: logInfo.getBloom_asU8(),
        topics: logInfo.getTopicList_asU8(),
        data: logInfo.getData_asU8()
    }));
}
