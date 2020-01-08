import { KeyList } from "./generated/BasicTypes_pb";
import { Duration } from "./generated/Duration_pb";
import { ResponseHeader } from "./generated/ResponseHeader_pb";
import { Response } from "./generated/Response_pb";
import { ValidationError } from "./errors";
import { Ed25519PublicKey } from "./crypto/Ed25519PublicKey";

export function orThrow<T>(val?: T, msg = "value must not be null"): T {
    return reqDefined(val, msg);
}

export function newDuration(seconds: number): Duration {
    if (!Number.isSafeInteger(seconds)) {
        throw new TypeError("duration cannot have fractional seconds");
    }

    const duration = new Duration();
    duration.setSeconds(seconds);
    return duration;
}

type EntityKind = "account" | "contract" | "file" | "topic";

type EntityId<Kind extends EntityKind> =
    ({ shard?: number; realm?: number } & Record<Kind, number>)
    | string | number;

type NormalizedId<Kind extends EntityKind> = Record<"shard" | "realm" | Kind, number>;

export function normalizeEntityId<Kind extends EntityKind>(
    kind: Kind,
    entityId: EntityId<Kind>
): NormalizedId<Kind> {
    switch (typeof entityId) {
        case "object":
            if (entityId[ kind ] == null) {
                break;
            }

            return {
            // defaults overwritten if they exist in `entityId`
                shard: 0,
                realm: 0,
                ...entityId
            };
        case "string": {
            const components = entityId.split(".");

            if (components.length === 1) {
                const id = { [ kind ]: Number(components[ 0 ]) } as EntityId<Kind>;
                return normalizeEntityId(kind, id);
            } else if (components.length === 3) {
                return {
                    shard: Number(components[ 0 ]),
                    realm: Number(components[ 1 ]),
                    [ kind ]: Number(components[ 2 ])
                } as NormalizedId<Kind>;
            }

            break;
        }
        case "number": {
            if (!Number.isInteger(entityId) || entityId < 0) {
                break;
            } else if (!Number.isSafeInteger(entityId)) {
            // this isn't really a `TypeError` as we already checked that it is a `number`
            // eslint-disable-next-line unicorn/prefer-type-error
                throw new Error(`${kind} ID outside safe integer range for number: ${entityId}`);
            }

            return normalizeEntityId(kind, { [ kind ]: entityId } as EntityId<Kind>);
        }
        default:
    }

    throw new Error(`invalid ${kind} ID: ${entityId}`);
}

export function getSdkKeys(keylist: KeyList): Ed25519PublicKey[] {
    return keylist.getKeysList().map((key) => Ed25519PublicKey.fromBytes(key.getEd25519_asU8()));
}

export function setTimeoutAwaitable(timeoutMs: number): Promise<null> {
    return new Promise((resolve) => setTimeout(resolve, timeoutMs));
}

export function timeoutPromise<T>(
    ms: number,
    promise: Promise<T>,
    timedOutCallback: (reject: (reason: Error) => void) => void
): Promise<T> {
    const timeout = new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            timedOutCallback(reject);
        }, ms);
    });

    return Promise.race<T>([ promise, timeout ]);
}

export interface GetHeader {
    getHeader(): ResponseHeader | undefined;
}

export function reqDefined<T>(val: T | undefined, msg: string): T {
    if (val == null) {
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
        default:
            throw new Error(`unsupported response case ${response.getResponseCase()}`);
    }
}

// From https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder
export function utf8encode(str: string): Uint8Array {
    const len = str.length;
    let resPos = -1;

    // The Uint8Array's length must be at least 3x the length of the string because an invalid UTF-16
    //  takes up the equivelent space of 3 UTF-8 characters to encode it properly. However, Array's
    //  have an auto expanding length and 1.5x should be just the right balance for most uses.
    const resArr = new Uint8Array(len * 3);
    for (let point = 0, nextcode = 0, i = 0; i !== len;) {
        point = str.charCodeAt(i);
        i += 1;
        if (point >= 0xD800 && point <= 0xDBFF) {
            if (i === len) {
                resArr[ resPos += 1 ] = 0xEF/* 0b11101111*/;
                resArr[ resPos += 1 ] = 0xBF/* 0b10111111*/;
                resArr[ resPos += 1 ] = 0xBD/* 0b10111101*/;
                break;
            }
            // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            nextcode = str.charCodeAt(i);
            if (nextcode >= 0xDC00 && nextcode <= 0xDFFF) {
                point = (point - 0xD800) * 0x400 + nextcode - 0xDC00 + 0x10000;
                i += 1;
                if (point > 0xFFFF) {
                    resArr[ resPos += 1 ] = (0x1E/* 0b11110*/ << 3) | (point >>> 18);
                    resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) |
                        ((point >>> 12) & 0x3F/* 0b00111111*/);
                    resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) |
                        ((point >>> 6) & 0x3F/* 0b00111111*/);
                    resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) |
                        (point & 0x3F/* 0b00111111*/);
                    continue;
                }
            } else {
                resArr[ resPos += 1 ] = 0xEF/* 0b11101111*/;
                resArr[ resPos += 1 ] = 0xBF/* 0b10111111*/;
                resArr[ resPos += 1 ] = 0xBD/* 0b10111101*/;
                continue;
            }
        }
        if (point <= 0x007F) {
            resArr[ resPos += 1 ] = (0x0/* 0b0*/ << 7) | point;
        } else if (point <= 0x07FF) {
            resArr[ resPos += 1 ] = (0x6/* 0b110*/ << 5) | (point >>> 6);
            resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) | (point & 0x3F/* 0b00111111*/);
        } else {
            resArr[ resPos += 1 ] = (0xE/* 0b1110*/ << 4) | (point >>> 12);
            resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) | ((point >>> 6) & 0x3F/* 0b00111111*/);
            resArr[ resPos += 1 ] = (0x2/* 0b10*/ << 6) | (point & 0x3F/* 0b00111111*/);
        }
    }

    return resArr.subarray(0, resPos + 1);
}
