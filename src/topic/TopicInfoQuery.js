import Query from "../Query";
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
    constructor(props) {
        super();

        /**
         * @private
         * @type {?TopicId}
         */
        this._topicId = null;

        if (props?.topicId != null) {
            this.setTopicId(props?.topicId);
        }
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
    _getQueryMethod(channel) {
        return (query) => channel.consensus.getTopicInfo(query);
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
     * @protected
     * @override
     * @param {proto.IQueryHeader} queryHeader
     * @returns {proto.IQuery}
     */
    _makeRequest(queryHeader) {
        return {
            consensusGetTopicInfo: {
                header: queryHeader,
                topicID: this._topicId?._toProtobuf(),
            },
        };
    }
}
