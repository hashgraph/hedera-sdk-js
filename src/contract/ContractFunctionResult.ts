import { ContractLogInfo, contractLogInfoListToSdk } from "./ContractLogInfo";
import { ContractFunctionResult as ProtoContractFunctionResult } from "../generated/ContractCallLocal_pb";
import { ContractId, contractIdToSdk } from "./ContractId";

export type ContractFunctionResult = {
    contractId: ContractId;
    contractCallResult: Uint8Array | string;
    errorMessage: string;
    bloom: Uint8Array;
    gasUsed: number;
    logInfoList: ContractLogInfo[];
}

/* eslint-disable-next-line max-len */
export function contractFunctionResultToSdk(result: ProtoContractFunctionResult): ContractFunctionResult {
    return {
        contractId: contractIdToSdk(result.getContractid()!),
        contractCallResult: result.getContractcallresult(),
        errorMessage: result.getErrormessage(),
        bloom: result.getBloom_asU8(),
        gasUsed: result.getGasused(),
        logInfoList: contractLogInfoListToSdk(result.getLoginfoList())
    };
}
