import {ContractLoginfo as ProtoContractLoginfo} from "../generated/ContractCallLocal_pb";
import {ContractId, contractIdToSdk} from "./ContractId";

export type ContractLogInfo = {
    contractId: ContractId;
    bloom: Uint8Array;
    topicList: Uint8Array[];
    data: Uint8Array;
}

export function contractLogInfoListToSdk(logInfoList: ProtoContractLoginfo[]): ContractLogInfo[] {
    return logInfoList.map((logInfo) => {
        return {
            contractId: contractIdToSdk(logInfo.getContractid()!),
            bloom: logInfo.getBloom_asU8(),
            topicList: logInfo.getTopicList_asU8(),
            data: logInfo.getData_asU8()
        };
    });
}