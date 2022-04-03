import * as HashgraphProto from "@hashgraph/proto";

export default class StorageChange {
    /**
     * @private
     * @param {object} props
     * @param {Uint8Array} props.slot
     * @param {Uint8Array} props.valueRead
     * @param {Uint8Array?} props.valueWritten
     */
    constructor(props) {
        this.slot = props.slot;
        this.valueRead = props.valueRead;
        this.valueWritten = props.valueWritten;
    }

    /**
     * @internal
     * @param {HashgraphProto.proto.IStorageChange} change
     * @returns {StorageChange}
     */
    static _fromProtobuf(change) {
        return new StorageChange({
            slot: /** @type {Uint8Array} */ (change.slot),
            valueRead: /** @type {Uint8Array} */ (change.valueRead),
            valueWritten:
                change.valueWritten != null && change.valueWritten.value != null
                    ? change.valueWritten.value
                    : null,
        });
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {StorageChange}
     */
    static fromBytes(bytes) {
        return StorageChange._fromProtobuf(
            HashgraphProto.proto.StorageChange.decode(bytes)
        );
    }

    /**
     * @internal
     * @returns {HashgraphProto.proto.IStorageChange}
     */
    _toProtobuf() {
        return {
            slot: this.slot,
            valueRead: this.valueRead,
            valueWritten:
                this.valueWritten != null ? { value: this.valueWritten } : null,
        };
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return HashgraphProto.proto.StorageChange.encode(
            this._toProtobuf()
        ).finish();
    }
}
