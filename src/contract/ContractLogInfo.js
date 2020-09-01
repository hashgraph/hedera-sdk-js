import ContractId from "./ContractId";
import proto from "@hashgraph/proto";

/**
 * The log information for an event returned by a smart contract function call. One function call
 * may return several such events.
 */
export default class ContractLogInfo {
    /**
     * @param {object} properties
     * @param {ContractId} properties.contractId
     * @param {Uint8Array} properties.bloom
     * @param {Uint8Array[]} properties.topics
     * @param {Uint8Array} properties.data
     */
    constructor(properties) {
        /**
         * Address of a contract that emitted the event.
         */
        this.contractId = properties.contractId;

        /**
         * Bloom filter for a particular log.
         */
        this.bloom = properties.bloom;

        /**
         * Topics of a particular event.
         */
        this.topics = properties.topics;

        /**
         * Event data.
         */
        this.data = properties.data;
    }

    /**
     * @param {proto.IContractLoginfo} info
     * @returns {ContractLogInfo}
     */
    static _fromProtobuf(info) {
        return new ContractLogInfo({
            // @ts-ignore
            contractId: ContractId._fromProtobuf(info.contractID),
            // @ts-ignore
            bloom: info.bloom,
            // @ts-ignore
            topics: info.topic,
            // @ts-ignore
            data: info.data,
        });
    }

    /**
     * @returns {proto.IContractLoginfo}
     */
    _toProtobuf() {
        return {
            contractID: this.contractId._toProtobuf(),
            bloom: this.bloom,
            topic: this.topics,
            data: this.data,
        };
    }
}
