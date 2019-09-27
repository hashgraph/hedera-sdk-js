import {ExchangeRate as ProtoExchangeRate, ExchangeRateSet as ProtoExchangeRateSet} from "../generated/ExchangeRate_pb";

export type ExchangeRateSet = {
    currentRate: ExchangeRate;
    nextRate: ExchangeRate;
}

export type ExchangeRate = {
    hbarEquiv: number;
    centEquiv: number;
    expirationTime: Date;
}

export function exchangeRateToSdk(exchangeRate: ProtoExchangeRate): ExchangeRate {
    return {
        hbarEquiv: exchangeRate.getHbarequiv(),
        centEquiv: exchangeRate.getCentequiv(),
        expirationTime: new Date(exchangeRate.getExpirationtime()!.getSeconds())
    }
}

export function exchangeRateSetToSdk(exchangeRateSet: ProtoExchangeRateSet): ExchangeRateSet {
    return {
        currentRate: exchangeRateToSdk(exchangeRateSet.getCurrentrate()!),
        nextRate: exchangeRateToSdk(exchangeRateSet.getCurrentrate()!)
    }
}