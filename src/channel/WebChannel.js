import * as utf8 from "../encoding/utf8.js";
import Channel from "./Channel.js";

export default class WebChannel extends Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        super();

        /**
         * @type {string}
         * @private
         */
        this._address = address;
    }

    /**
     * @override
     * @returns {void}
     */
    close() {
        // do nothing
    }

    /**
     * @override
     * @protected
     * @param {string} serviceName
     * @returns {import("@hashgraph/protobufjs").RPCImpl}
     */
    _createUnaryClient(serviceName) {
        return async (method, requestData, callback) => {
            const response = await fetch(
                `${this._address}/proto.${serviceName}/${method.name}`,
                {
                    method: "POST",
                    headers: {
                        "content-type": "application/grpc-web+proto",
                        "x-user-agent": "hedera-sdk-js/v2",
                        "x-grpc-web": "1",
                    },
                    body: encodeRequest(requestData),
                }
            );

            const responseBuffer = await response.arrayBuffer();
            const unaryResponse = decodeUnaryResponse(responseBuffer);

            callback(null, unaryResponse);
        };
    }
}

// grpc-web+proto is a series of data or trailer frames

// a frame is identified by a single byte (0 = data or 1 = trailer) followed by 4 bytes for the
// length of the frame, followed by the frame data

/**
 * @param {Uint8Array} data
 * @returns {ArrayBuffer}
 */
function encodeRequest(data) {
    // for our requests, we want to transfer a single data frame

    const frame = new ArrayBuffer(data.byteLength + 5);

    // the frame type (data) is zero and can be left default-initialized

    // the length of the frame data
    new DataView(frame, 1, 4).setUint32(0, data.length);

    // copy in the frame data
    new Uint8Array(frame, 5).set(data);

    return frame;
}

/**
 * @param {ArrayBuffer} data
 * @returns {Uint8Array}
 */
function decodeUnaryResponse(data) {
    let dataOffset = 0;

    /** @type {?Uint8Array} */
    let unaryResponse = null;

    // 0 = successful
    let status = 0;

    while (dataOffset < data.byteLength) {
        const dataView = new DataView(data, dataOffset);
        const frameByte = dataView.getUint8(0);
        const frameType = frameByte >> 7;
        const frameByteLength = dataView.getUint32(1);
        const frameData = new Uint8Array(data, dataOffset + 5, frameByteLength);

        if (frameType === 0) {
            if (unaryResponse != null) {
                throw new Error(
                    "(BUG) unexpectedly received more than one data frame"
                );
            }

            unaryResponse = frameData;
        } else if (frameType === 1) {
            const trailer = utf8.decode(frameData);
            const [trailerName, trailerValue] = trailer.split(":");

            if (trailerName === "grpc-status") {
                status = parseInt(trailerValue);
            } else {
                throw new Error(`(BUG) unhandled trailer, ${trailer}`);
            }
        } else {
            throw new Error(`(BUG) unexpected frame type: ${frameType}`);
        }

        dataOffset += frameByteLength + 5;
    }

    if (status !== 0) {
        throw new Error(`(BUG) unhandled grpc-status: ${status}`);
    }

    if (unaryResponse == null) {
        throw new Error("(BUG) unexpectedly received no response");
    }

    return unaryResponse;
}
