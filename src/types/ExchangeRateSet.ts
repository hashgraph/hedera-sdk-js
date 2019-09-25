import {ExchangeRate, exchangeRateToSdk} from "./ExchangeRate";
import {ExchangeRateSet as ProtoExchangeRateSet} from "../generated/ExchangeRate_pb";

export type ExchangeRateSet = {
    currentRate: ExchangeRate;
    nextRate: ExchangeRate;
}

export function exchangeRateSetToSdk(exchangeRateSet: ProtoExchangeRateSet): ExchangeRateSet {
    return {
        currentRate: exchangeRateToSdk(exchangeRateSet.getCurrentrate()!),
        nextRate: exchangeRateToSdk(exchangeRateSet.getCurrentrate()!)
    }
}
