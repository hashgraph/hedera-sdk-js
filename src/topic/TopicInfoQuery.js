import Query, { QUERY_REGISTRY } from "../query/Query";
import TopicId from "./TopicId";
import TopicInfo from "./TopicInfo";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IConsensusTopicQuery} proto.IConsensusTopicQuery
 * @typedef {import("@hashgraph/proto").IConsensusGetTopicInfoResponse} proto.IConsensusGetTopicInfoResponse
 */

/**
 * @typedef {import("../channel/Channel").default} Channel
 */

/**
 * Retrieve the latest state of a topic.
 *
 * @augments {Query<TopicInfo>}
 */
export default class TopicInfoQuery extends Query {
    /**
     * @param {object} [props]
     * @param {TopicId | string} [props.topicId]
     */
    constructor(props = {}) {
        super();

        /**
         * @private
         * @type {?TopicId}
         */
        this._topicId = null;

        if (props.topicId != null) {
            this.setTopicId(props.topicId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {TopicInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.IConsensusTopicQuery} */ (query.consensusGetTopicInfo);

        return new TopicInfoQuery({
            topicId:
                info.topicID != null
                    ? TopicId._fromProtobuf(info.topicID)
                    : undefined,
        });
    }

    /**
     * @returns {?TopicId}
     */
    get topicId() {
        return this._topicId;
    }

    /**
     * Set the topic ID for which the info is being requested.
     *
     * @param {TopicId | string} topicId
     * @returns {TopicInfoQuery}
     */
    setTopicId(topicId) {
        this._topicId =
            topicId instanceof TopicId ? topicId : TopicId.fromString(topicId);

        return this;
    }

    /**
     * @override
     * @protected
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.consensus.getTopicInfo(request);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const consensusGetTopicInfo = /** @type {proto.IConsensusGetTopicInfoResponse} */ (response.consensusGetTopicInfo);
        return /** @type {proto.IResponseHeader} */ (consensusGetTopicInfo.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {Promise<TopicInfo>}
     */
    _mapResponse(response) {
        return Promise.resolve(
            TopicInfo._fromProtobuf(
                /** @type {proto.IConsensusGetTopicInfoResponse} */ (response.consensusGetTopicInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            consensusGetTopicInfo: {
                header: this._makeRequestHeader(),
                topicID:
                    this._topicId != null ? this._topicId._toProtobuf() : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("consensusGetTopicInfo", TopicInfoQuery._fromProtobuf);
