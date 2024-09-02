/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").proto.PendingAirdropId} HashgraphProto.proto.PendingAirdropId
 */

import AccountId from "../account/AccountId.js";
import TokenId from "./TokenId.js";
import NftId from "./NftId.js";

export default class PendingAirdropId {
    /**
     *
     * @param {object} props
     * @param {AccountId} [props.senderId]
     * @param {AccountId} [props.receiverId]
     * @param {TokenId?} props.tokenId
     * @param {NftId?} props.nftId
     */
    constructor(props) {
        this._senderId = null;
        this._receiverId = null;
        this._tokenId = null;
        this._nftId = null;

        if (props.receiverId) {
            this.setReceiverId(props.receiverId);
        }
        if (props.senderId) {
            this.setSenderid(props.senderId);
        }
        if (props.tokenId) {
            this._tokenId = new TokenId(props.tokenId);
        } else if (props.nftId) {
            this._nftId = new NftId(props.nftId?.tokenId, props.nftId?.serial);
        }
    }

    /**
     * @param {HashgraphProto.proto.PendingAirdropId} pb
     * @returns {PendingAirdropId}
     */
    static fromBytes(pb) {
        if (pb.senderId == null) {
            throw new Error("senderId is required");
        }

        if (pb.receiverId == null) {
            throw new Error("receiverId is required");
        }

        if (pb.fungibleTokenType == null && pb.nonFungibleToken == null) {
            throw new Error(
                "Either fungibleTokenType or nonFungibleToken is required",
            );
        }

        return new PendingAirdropId({
            senderId: AccountId._fromProtobuf(pb.senderId),
            receiverId: AccountId._fromProtobuf(pb.receiverId),
            nftId:
                pb.nonFungibleToken != null
                    ? NftId._fromProtobuf(pb.nonFungibleToken)
                    : null,
            tokenId:
                pb.fungibleTokenType != null
                    ? TokenId._fromProtobuf(pb.fungibleTokenType)
                    : null,
        });
    }

    /**
     *
     * @param {AccountId} senderId
     * @returns
     */
    setSenderid(senderId) {
        this._senderId = senderId;
        return this;
    }

    /**
     * @param {AccountId} receiverId
     * @returns {this}
     */
    setReceiverId(receiverId) {
        this._receiverId = receiverId;
        return this;
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
     * @param {NftId} nftId
     * @returns {this}
     */
    setNftId(nftId) {
        this._nftId = nftId;
        return this;
    }

    /**
     * @returns {?AccountId}
     */
    get senderId() {
        return this._senderId;
    }

    /**
     * @returns {?AccountId}
     */
    get receiverId() {
        return this._receiverId;
    }

    /**
     * @returns {?TokenId}
     */
    get tokenId() {
        return this._tokenId;
    }

    /**
     * @returns {?NftId}
     */
    get nftId() {
        return this._nftId;
    }

    /**
     *  @returns {HashgraphProto.proto.PendingAirdropId}
     */
    toBytes() {
        return {
            senderId: this.senderId?._toProtobuf(),
            receiverId: this._receiverId?._toProtobuf(),
            fungibleTokenType: this._tokenId?._toProtobuf(),
            nonFungibleToken: this._nftId?._toProtobuf(),
        };
    }
}
