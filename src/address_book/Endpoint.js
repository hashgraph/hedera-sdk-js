import IPv4Address from "./IPv4Address.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IServiceEndpoint} proto.IServiceEndpoint
 */

/**
 * @typedef {object} EndPointJson
 * @property {string | null} address
 * @property {string | null} port
 */

export default class EndPoint {
    /**
     * @param {object} props
     * @param {IPv4Address} [props.address]
     * @param {number} [props.port]
     */
    constructor(props = {}) {
        /**
         * @type {IPv4Address | null}
         */
        this._address = null;

        if (props.address != null) {
            this.setAddress(props.address);
        }

        /**
         * @type {number | null}
         */
        this._port = null;

        if (props.port != null) {
            this.setPort(props.port);
        }
    }

    /**
     * @returns {?IPv4Address}
     */
    get address() {
        return this.address;
    }

    /**
     * @param {IPv4Address} address
     * @returns {this}
     */
    setAddress(address) {
        this._address = address;
        return this;
    }

    /**
     * @returns {?number}
     */
    get port() {
        return this._port;
    }

    /**
     * @param {number} port
     * @returns {this}
     */
    setPort(port) {
        this._port = port;
        return this;
    }

    /**
     * @internal
     * @param {proto.IServiceEndpoint} endpoint
     * @returns {EndPoint}
     */
    static _fromProtobuf(endpoint) {
        return new EndPoint({
            address:
                endpoint.ipAddressV4 != null
                    ? IPv4Address._fromProtobuf(endpoint.ipAddressV4)
                    : undefined,
            port: endpoint.port != null ? endpoint.port : undefined,
        });
    }

    /**
     * @returns {proto.IServiceEndpoint}
     */
    _toProtobuf() {
        return {
            ipAddressV4:
                this._address != null ? this._address._toProtobuf() : null,
            port: this._port,
        };
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.toJSON());
    }

    /**
     * @returns {EndPointJson}
     */
    toJSON() {
        return {
            address: this._address != null ? this._address.toString() : null,
            port: this._port != null ? this._port.toString() : null,
        };
    }
}
