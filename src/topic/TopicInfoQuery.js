import Query, { QUERY_REGISTRY } from "../Query";
import TopicId from "./TopicId";
import TopicInfo from "./TopicInfo";
import proto from "@hashgraph/proto";
import Channel from "../Channel";

/**
 * Retrieve the latest state of a topic.
 *
 * @augments {Query<TopicInfo>}
 */
export default class TopicInfoQuery extends Query {
    /**
     * @param {object} props
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
     * @param {proto.Query} query
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
    getTopicId() {
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
     * @protected
     * @override
     * @param {Channel} channel
     * @returns {(query: proto.IQuery) => Promise<proto.IResponse>}
     */
    _getMethod(channel) {
        return (query) => channel.consensus.getTopicInfo(query);
    }

    /**
     * @protected
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        return /** @type {proto.IResponseHeader} */ (response
            .consensusGetTopicInfo?.header);
    }

    /**
     * @protected
     * @override
     * @param {proto.IResponse} response
     * @returns {TopicInfo}
     */
    _mapResponse(response) {
        return TopicInfo._fromProtobuf(
            /** @type {proto.IConsensusGetTopicInfoResponse} */ (response.consensusGetTopicInfo)
        );
    }

    /**
     * @internal
     * @override
     * @returns {proto.IQuery}
     */
    _makeRequest() {
        return {
            consensusGetTopicInfo: {
                header: {
                    responseType: proto.ResponseType.ANSWER_ONLY,
                },
                topicID:
                    this._topicId != null ? this._topicId._toProtobuf() : null,
            },
        };
    }
}

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("consensusGetTopicInfo", TopicInfoQuery._fromProtobuf);
