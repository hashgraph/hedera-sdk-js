import proto from "@hashgraph/proto";
import Channel from "./Channel";

export default class WebChannel extends Channel {
    /**
     * @param {string} address
     */
    constructor(address) {
        super(address);

        /**
         * @type {string}
         * @private
         */
        this._address = address;
    }

    /**
     * @override
     * @returns {proto.CryptoService}
     */
    get crypto() {
        if (this._crypto != null) {
            return this._crypto;
        }

        this._crypto = proto.CryptoService.create(
            rpcImpl(this._address, proto.CryptoService.name),
            false,
            false
        );

        return this._crypto;
    }
}

/**
 * https://github.com/grpc/grpc-web/issues/80
 *
 * @param {string} host
 * @param {string} serviceName
 * @returns {import("protobufjs").RPCImpl}
 */
function rpcImpl(host, serviceName) {
    return async (method, requestData, callback) => {
        const request = await fetch(`${host}/${serviceName}/${method.name}`, {
            method: "POST",
            headers: {
                "content-type": "application/grpc-web+proto",
                "x-grpc-web": "1",
            },
            body: frameRequest(requestData),
        });

        const buffer = new Uint8Array(await request.arrayBuffer());

        callback(null, buffer);
    };
}

/**
 * @param {Uint8Array} bytes
 * @returns {ArrayBuffer}
 */
function frameRequest(bytes) {
    const frame = new ArrayBuffer(bytes.byteLength + 5);
    new DataView(frame, 1, 4).setUint32(0, bytes.length, false);
    new Uint8Array(frame, 5).set(bytes);
    return new Uint8Array(frame);
}
