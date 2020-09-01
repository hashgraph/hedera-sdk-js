import Query from "../Query";
import TopicId from "./TopicId";
import TopicInfo from "./TopicInfo";
import proto from "@hashgraph/proto";

/**
 * @augments {Query<TopicInfo>}
 */
export default class TopicInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {TopicId | string} [properties.topicId]
     */
    constructor(properties) {
        super();

        /**
         * @private
         * @type {?TopicId}
         */
        this._topicId = null;
        if (properties?.topicId != null) {
            this.setTopicId(properties?.topicId);
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
     * @param {proto.IResponse} response
     * @returns {TopicInfo}
     */
    _mapResponse(response) {
        return TopicInfo._fromProtobuf(
            // @ts-ignore
            response.consensusGetTopicInfo.topicInfo
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
