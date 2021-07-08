import TokenId from "../token/TokenId.js";
import AccountId from "../account/AccountId.js";
import ObjectMap from "../ObjectMap.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").ITokenTransferList} proto.ITokenTransferList
 * @typedef {import("@hashgraph/proto").INftTransfer} proto.INftTransfer
 * @typedef {import("@hashgraph/proto").IAccountAmount} proto.IAccountAmount
 * @typedef {import("@hashgraph/proto").ITokenID} proto.ITokenID
 * @typedef {import("@hashgraph/proto").IAccountID} proto.IAccountID
 */

/**
 * @typedef {object} NftTransfer
 * @property {AccountId} sender
 * @property {AccountId} recipient
 * @property {Long} serial
 */

/**
 * @augments {ObjectMap<TokenId, NftTransfer[]>}
 */
export default class TokenNftTransferMap extends ObjectMap {
    constructor() {
        super((s) => TokenId.fromString(s));
    }

    /**
     * @internal
     * @param {TokenId} tokenId
     * @param {NftTransfer} nftTransfer
     */
    __set(tokenId, nftTransfer) {
        const token = tokenId.toString();

        let _map = this._map.get(token);
        if (_map == null) {
            _map = [];
            this._map.set(token, _map);
            this.__map.set(tokenId, _map);
        }

        _map.push(nftTransfer);
    }

    /**
     * @param {proto.ITokenTransferList[]} transfers
     * @param {(string | null)=} ledgerId
     * @returns {TokenNftTransferMap}
     */
    static _fromProtobuf(transfers, ledgerId) {
        const tokenTransfersMap = new TokenNftTransferMap();

        for (const transfer of transfers) {
            const token = TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (transfer.token),
                ledgerId
            );

            for (const aa of transfer.nftTransfers != null
                ? transfer.nftTransfers
                : []) {
                const sender = AccountId._fromProtobuf(
                    /** @type {proto.IAccountID} */ (aa.senderAccountID),
                    ledgerId
                );
                const recipient = AccountId._fromProtobuf(
                    /** @type {proto.IAccountID} */ (aa.receiverAccountID),
                    ledgerId
                );

                tokenTransfersMap.__set(token, {
                    sender,
                    recipient,
                    serial: /** @type {Long} */ (aa.serialNumber),
                });
            }
        }

        return tokenTransfersMap;
    }

    /**
     * @returns {proto.ITokenTransferList[]}
     */
    _toProtobuf() {
        /** @type {proto.ITokenTransferList[]} */
        const tokenTransferList = [];

        for (const [tokenId, value] of this) {
            /** @type {proto.INftTransfer[]} */
            const transfers = [];

            for (const transfer of value) {
                transfers.push({
                    senderAccountID: transfer.sender._toProtobuf(),
                    receiverAccountID: transfer.recipient._toProtobuf(),
                    serialNumber: transfer.serial,
                });
            }

            tokenTransferList.push({
                token: tokenId._toProtobuf(),
                nftTransfers: transfers,
            });
        }

        return tokenTransferList;
    }
}
