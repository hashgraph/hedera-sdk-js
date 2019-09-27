import {KeyList} from "./generated/BasicTypes_pb";
import {Timestamp} from "./generated/Timestamp_pb";
import {Duration} from "./generated/Duration_pb";
import {ResponseHeader} from "./generated/ResponseHeader_pb";
import {TransactionResponse} from "./generated/TransactionResponse_pb";
import {Response} from "./generated/Response_pb";
import {throwIfExceptional, ValidationError} from "./errors";
import {Ed25519PublicKey} from "./Keys";

export function orThrow<T>(val?: T, msg = 'value must not be null'): T {
    if (val === undefined || val === null) {
        throw new Error(msg);
    }

    return val;
}

export function newDuration(seconds: number): Duration {
    if (!Number.isSafeInteger(seconds)) {
        throw new TypeError('duration cannot have fractional seconds')
    }

    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

type EntityKind = 'account' | 'contract' | 'file';

type EntityId<Kind extends EntityKind> =
    ({ shard?: number; realm?: number } & Record<Kind, number>)
    | string | number;

type NormalizedId<Kind extends EntityKind> = Record<'shard' | 'realm' | Kind, number>;

export function normalizeEntityId<Kind extends EntityKind>(kind: Kind, entityId: EntityId<Kind>): NormalizedId<Kind> {
    switch (typeof entityId) {
        case 'object':
            if (!entityId[kind]) {
                break;
            }

            return {
                // defaults overwritten if they exist in `entityId`
                shard: 0,
                realm: 0,
                ...entityId
            };
        case "string": {
            const components = entityId.split('.');

            if (components.length === 1) {
                return normalizeEntityId(kind, { [kind]: Number(components[0])} as EntityId<Kind>);
            } else if (components.length === 3) {
                return {
                    shard: Number(components[0]),
                    realm: Number(components[1]),
                    [kind]: Number(components[2])
                } as NormalizedId<Kind>
            }

            break;
        }
        case 'number': {
            if (!Number.isInteger(entityId) || entityId < 0) {
                break;
            } else if (!Number.isSafeInteger(entityId)) {
                // this isn't really a `TypeError` as we already checked that it is a `number`
                // eslint-disable-next-line unicorn/prefer-type-error
                throw new Error(`${kind} ID outside safe integer range for number: ${entityId}`)
            }

            return normalizeEntityId(kind, { [kind]: entityId } as EntityId<Kind>);
        }
    }

    throw new Error(`invalid ${kind} ID: ${entityId}`);
}

export function timestampToProto({ seconds, nanos }: { seconds: number; nanos: number }): Timestamp {
    const timestamp = new Timestamp();
    timestamp.setSeconds(seconds);
    timestamp.setNanos(nanos);
    return timestamp;
}

export function getSdkKeys(keylist: KeyList): Ed25519PublicKey[] {
    return keylist.getKeysList().map((key) => new Ed25519PublicKey(key.getEd25519() as Uint8Array));
}


export function setTimeoutAwaitable(timeoutMs: number): Promise<undefined> {
    return new Promise(resolve => setTimeout(resolve, timeoutMs));
}

export interface GetHeader {
    getHeader(): ResponseHeader | undefined;
}

export function handleQueryPrecheck<T extends GetHeader>(getBody: (r: Response) => T | undefined): (r: undefined | Response) => T {
    return (resp) => {
        const body = reqDefined(
            getBody(reqDefined(resp, 'missing Response')),
            'missing body from Response'
        );

        const header = reqDefined(body.getHeader(), 'missing header from Response');

        const precheck = header.getNodetransactionprecheckcode();

        throwIfExceptional(precheck);
        return body;
    }
}

export function handlePrecheck(resp_: TransactionResponse | undefined): TransactionResponse {
    const resp = reqDefined(resp_, 'missing TransactionResponse');
    const precheck = resp.getNodetransactionprecheckcode();

    throwIfExceptional(precheck);
    return resp;
}

export function reqDefined<T>(val: T | undefined, msg: string): T {
    if (val === undefined) {
        throw new Error(msg);
    }

    return val;
}

export function runValidation(instance: object, doValidate: (errors: string[]) => void): void {
    const errors: string[] = [];
    doValidate(errors);
    if (errors.length > 0) {
        throw new ValidationError(instance.constructor.name, errors);
    }
}

export function getResponseHeader(response: Response): ResponseHeader {
    switch (response.getResponseCase()) {
        case Response.ResponseCase.RESPONSE_NOT_SET:
            throw new Error(`expected body for query response: ${response.toString()}`);
        case Response.ResponseCase.GETBYKEY:
            return response.getGetbykey()!.getHeader()!;
        case Response.ResponseCase.GETBYSOLIDITYID:
            return response.getGetbysolidityid()!.getHeader()!;
        case Response.ResponseCase.CONTRACTCALLLOCAL:
            return response.getContractcalllocal()!.getHeader()!;
        case Response.ResponseCase.CONTRACTGETBYTECODERESPONSE:
            return response.getContractgetbytecoderesponse()!.getHeader()!;
        case Response.ResponseCase.CONTRACTGETINFO:
            return response.getContractgetinfo()!.getHeader()!;
        case Response.ResponseCase.CONTRACTGETRECORDSRESPONSE:
            return response.getContractgetrecordsresponse()!.getHeader()!;
        case Response.ResponseCase.CRYPTOGETACCOUNTBALANCE:
            return response.getCryptogetaccountbalance()!.getHeader()!;
        case Response.ResponseCase.CRYPTOGETACCOUNTRECORDS:
            return response.getCryptogetaccountrecords()!.getHeader()!;
        case Response.ResponseCase.CRYPTOGETINFO:
            return response.getCryptogetinfo()!.getHeader()!;
        case Response.ResponseCase.CRYPTOGETCLAIM:
            return response.getCryptogetclaim()!.getHeader()!;
        case Response.ResponseCase.CRYPTOGETPROXYSTAKERS:
            return response.getCryptogetproxystakers()!.getHeader()!;
        case Response.ResponseCase.FILEGETCONTENTS:
            return response.getFilegetcontents()!.getHeader()!;
        case Response.ResponseCase.FILEGETINFO:
            return response.getFilegetinfo()!.getHeader()!;
        case Response.ResponseCase.TRANSACTIONGETRECEIPT:
            return response.getTransactiongetreceipt()!.getHeader()!;
        case Response.ResponseCase.TRANSACTIONGETRECORD:
            return response.getTransactiongetrecord()!.getHeader()!;
        case Response.ResponseCase.TRANSACTIONGETFASTRECORD:
            return response.getTransactiongetfastrecord()!.getHeader()!;
    }
}
