import Query from "../Query";
import ContractId from "./ContractId";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<Uint8Array>}
 */
export default class ContractByteCodeQuery extends Query {
    /**
     * @param {object} properties
     * @param {ContractId | string} [properties.contractId]
     */
    constructor(properties) {
        super();

        /**
         * @type {?ContractId}
         * @private
         */
        this._contractId = null;
        if (properties?.contractId != null) {
            this.setContractId(properties?.contractId);
        }
    }

    /**
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
     * @param {proto.IResponse} response
     * @returns {Uint8Array}
     */
    _mapResponse(response) {
        return (
            response?.contractGetBytecodeResponse?.bytecode ?? new Uint8Array()
        );
    }

    /**
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            contractGetBytecode: {
                header: queryHeader,
                contractID: this._contractId?._toProtobuf(),
            },
        };
    }
}
