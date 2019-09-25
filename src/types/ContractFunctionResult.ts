import {ContractLogInfo, contractLogInfoListToSdk} from "./ContractLogInfo";
import {ContractFunctionResult as ProtoContractFunctionResult} from "../generated/ContractCallLocal_pb";
import {ContractId, contractIdToSdk} from "./ContractId";

export type ContractFunctionResult = {
    contractId: ContractId;
    contractCallResult: Uint8Array | string;
    errorMessage: string;
    bloom: Uint8Array | string;
    gasUsed: number;
    logInfoList: ContractLogInfo[];
}

export function contractFunctionResultToSdk(result: ProtoContractFunctionResult): ContractFunctionResult {
    return {
        contractId: contractIdToSdk(result.getContractid()!),
        contractCallResult: result.getContractcallresult(),
        errorMessage: result.getErrormessage(),
        bloom: result.getBloom(),
        gasUsed: result.getGasused(),
        logInfoList: contractLogInfoListToSdk(result.getLoginfoList())
    }
}