import {ExchangeRate as ProtoExchangeRate} from "../generated/ExchangeRate_pb";

export type ExchangeRate = {
    hbarEquiv: number;
    centEquiv: number;
    expirationTime: number;
}

export function exchangeRateToSdk(exchangeRate: ProtoExchangeRate): ExchangeRate {
    return {
        hbarEquiv: exchangeRate.getHbarequiv(),
        centEquiv: exchangeRate.getCentequiv(),
        expirationTime: exchangeRate.getExpirationtime()!.getSeconds()
    }
}