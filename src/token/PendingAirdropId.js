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
     * @param {AccountId} props.senderId
     * @param {AccountId} props.receiverId
     * @param {TokenId?} props.tokenId
     * @param {NftId?} props.nftId
     */
    constructor(props) {
        this.senderId = props.senderId;
        this.receiverId = props.receiverId;
        if (props.tokenId) {
            this.tokenId = new TokenId(props.tokenId);
        } else if (props.nftId) {
            this.nftId = new NftId(props.nftId?.tokenId, props.nftId?.serial);
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
     *  @returns {HashgraphProto.proto.PendingAirdropId}
     */
    toBytes() {
        return {
            senderId: this.senderId._toProtobuf(),
            receiverId: this.receiverId._toProtobuf(),
            fungibleTokenType: this.tokenId?._toProtobuf(),
            nonFungibleToken: this.nftId?._toProtobuf(),
        };
    }
}
