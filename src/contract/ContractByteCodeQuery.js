import Query, { QUERY_REGISTRY } from "../Query";
import ContractId from "./ContractId";
import proto from "@hashgraph/proto";
import Channel from "../channel/Channel";

/**
 * @augments {Query<Uint8Array>}
 */
export default class ContractByteCodeQuery extends Query {
    /**
     * @param {object} properties
     * @param {ContractId | string} [properties.contractId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;
        if (properties.contractId != null) {
            this.setContractId(properties.contractId);
        }
    }

    /**
     * @internal
     * @param {proto.Query} query
     * @returns {ContractByteCodeQuery}
     */
    static _fromProtobuf(query) {
        const bytecode = /** @type {proto.IContractGetBytecodeQuery} */ (query.contractGetBytecode);

        return new ContractByteCodeQuery({
            contractId:
                bytecode.contractID != null
                    ? ContractId._fromProtobuf(bytecode.contractID)
                    : undefined,
        });
    }

    /**
     * @returns {?ContractId}
     */
    getContractId() {
        return this._contractId;
    }

    /**
     * Set the contract ID for which the info is being requested.
     *
     * @param {ContractId | string} contractId
     * @returns {ContractByteCodeQuery}
     */
    setContractId(contractId) {
        this._contractId =
            contractId instanceof ContractId
                ? contractId
                : ContractId.fromString(contractId);

        return this;
    }

    /**
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.smartContract.contractGetBytecode(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const contractGetBytecodeResponse = /** @type {proto.IContractGetBytecodeResponse} */ (response.contractGetBytecodeResponse);
        return /** @type {proto.IResponseHeader} */ (contractGetBytecodeResponse.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Uint8Array}
     */
    _mapResponse(response) {
        const contractGetBytecodeResponse = /** @type {proto.IContractGetBytecodeResponse} */ (response.contractGetBytecodeResponse);
        return contractGetBytecodeResponse.bytecode != null
            ? contractGetBytecodeResponse.bytecode
            : new Uint8Array();
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            contractGetBytecode: {
                header,
                contractID:
                    this._contractId != null
                        ? this._contractId._toProtobuf()
                        : null,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("contractGetBytecode", ContractByteCodeQuery._fromProtobuf);
