/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.ITokenTransferList} HashgraphProto.proto.ITokenTransferList
 */
import AccountAmount from "./AccountAmount.js";
import TokenId from "./TokenId.js";
import TokenNftTransfer from "./TokenNftTransfer.js";

export default class TokenTransfer {
    /**
     * @param {object} props
     * @param {TokenId} [props.tokenId]
     * @param {AccountAmount[]} [props.accountAmounts]
     * @param {TokenNftTransfer[]} [props.tokenNftTransfers]
     * @param {number} [props.expectedDecimals]
     */
    constructor(props = {}) {
        /**
         * @private
         * @type {?TokenId}
         */
        this._tokenId = null;

        /**
         * @private
         * @type {AccountAmount[]}
         */
        this._accountAmounts = [];

        /**
         * @private
         * @type {TokenNftTransfer[]}
         */
        this._tokenNftTransfers = [];

        /**
         * @private
         * @type {?number}
         */
        this._expectedDecimals = null;

        if (props.tokenId != null) {
            this.setTokenId(props.tokenId);
        }

        if (props.accountAmounts != null) {
            this.setAccountAmounts(props.accountAmounts);
        }

        if (props.tokenNftTransfers != null) {
            this.setTokenNftTransfers(props.tokenNftTransfers);
        }

        if (props.expectedDecimals != null) {
            this.setExpectedDecimals(props.expectedDecimals);
        }
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @param {TokenId} tokenId
     * @returns {this}
     */
    setTokenId(tokenId) {
        this._tokenId = tokenId;
        return this;
    }

    /**
     * @returns {AccountAmount[]}
     */
    get accountAmounts() {
        return this._accountAmounts;
    }

    /**
     * @param {AccountAmount[]} accountAmounts
     * @returns {this}
     */
    setAccountAmounts(accountAmounts) {
        this._accountAmounts = accountAmounts;
        return this;
    }

    /**
     * @returns {TokenNftTransfer[]}
     */
    get tokenNftTransfers() {
        return this._tokenNftTransfers;
    }

    /**
     *
     * @param {TokenNftTransfer[]} tokenNftTransfers
     * @returns {this}
     */
    setTokenNftTransfers(tokenNftTransfers) {
        this._tokenNftTransfers = tokenNftTransfers;
        return this;
    }

    /**
     * @returns {?number}
     */
    get expectedDecimals() {
        return this._expectedDecimals;
    }

    /**
     *
     * @param {number} expectedDecimals
     * @returns {this}
     */
    setExpectedDecimals(expectedDecimals) {
        this._expectedDecimals = expectedDecimals;
        return this;
    }

    /**
     * @returns {HashgraphProto.proto.ITokenTransferList}
     */
    _toProtobuf() {
        return {
            token: this._tokenId != null ? this._tokenId._toProtobuf() : null,
            transfers: this._accountAmounts.map((accountAmount) =>
                accountAmount._toProtobuf(),
            ),
            nftTransfers: this._tokenNftTransfers.map((tokenNftTransfer) =>
                tokenNftTransfer._toProtobuf(),
            ),
            expectedDecimals:
                this._expectedDecimals != null
                    ? { value: this._expectedDecimals }
                    : null,
        };
    }

    /**
     * @param {HashgraphProto.proto.ITokenTransferList} tokenTransfer
     * @returns {TokenTransfer}
     */
    static _fromProtobuf(tokenTransfer) {
        return new TokenTransfer({
            tokenId:
                tokenTransfer.token != null
                    ? TokenId._fromProtobuf(tokenTransfer.token)
                    : undefined,
            accountAmounts: tokenTransfer.transfers?.map((transfer) =>
                AccountAmount._fromProtobuf(transfer),
            ),
            tokenNftTransfers: TokenNftTransfer._fromProtobuf([tokenTransfer]),
            expectedDecimals:
                tokenTransfer.expectedDecimals?.value || undefined,
        });
    }
}
