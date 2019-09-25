import {ContractLoginfo as ProtoContractLoginfo} from "../generated/ContractCallLocal_pb";
import {ContractId, contractIdToSdk} from "./ContractId";

export type ContractLogInfo = {
    contractId: ContractId;
    bloom: Uint8Array | string;
    topicList: (Uint8Array | string)[];
    data: Uint8Array | string;
}

export function contractLogInfoListToSdk(logInfoList: ProtoContractLoginfo[]): ContractLogInfo[] {
    return logInfoList.map((logInfo) => {
        return {
            contractId: contractIdToSdk(logInfo.getContractid()!),
            bloom: logInfo.getBloom(),
            topicList: logInfo.getTopicList(),
            data: logInfo.getData()
        };
    });
}