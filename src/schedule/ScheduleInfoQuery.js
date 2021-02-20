import Query, { QUERY_REGISTRY } from "../query/Query.js";
import ScheduleId from "./ScheduleId.js";
import ScheduleInfo from "./ScheduleInfo.js";

/**
 * @namespace proto
 * @typedef {import("@hashgraph/proto").IQuery} proto.IQuery
 * @typedef {import("@hashgraph/proto").IQueryHeader} proto.IQueryHeader
 * @typedef {import("@hashgraph/proto").IResponse} proto.IResponse
 * @typedef {import("@hashgraph/proto").IResponseHeader} proto.IResponseHeader
 * @typedef {import("@hashgraph/proto").IScheduleInfo} proto.IScheduleInfo
 * @typedef {import("@hashgraph/proto").IScheduleGetInfoQuery} proto.IScheduleGetInfoQuery
 * @typedef {import("@hashgraph/proto").IScheduleGetInfoResponse} proto.IScheduleGetInfoResponse
 */

/**
 * @typedef {import("../channel/Channel.js").default} Channel
 */

/**
 * @augments {Query<ScheduleInfo>}
 */
export default class ScheduleInfoQuery extends Query {
    /**
     * @param {object} properties
     * @param {ScheduleId | string} [properties.scheduleId]
     */
    constructor(properties = {}) {
        super();

        /**
         * @private
         * @type {?ScheduleId}
         */
        this._scheduleId = null;

        if (properties.scheduleId != null) {
            this.setScheduleId(properties.scheduleId);
        }
    }

    /**
     * @internal
     * @param {proto.IQuery} query
     * @returns {ScheduleInfoQuery}
     */
    static _fromProtobuf(query) {
        const info = /** @type {proto.IScheduleGetInfoQuery} */ (query.scheduleGetInfo);

        return new ScheduleInfoQuery({
            scheduleId:
                info.scheduleID != null
                    ? ScheduleId._fromProtobuf(info.scheduleID)
                    : undefined,
        });
    }

    /**
     * @returns {?ScheduleId}
     */
    get scheduleId() {
        return this._scheduleId;
    }

    /**
     *
     * @param {ScheduleId | string} scheduleId
     * @returns {ScheduleInfoQuery}
     */
    setScheduleId(scheduleId) {
        this._scheduleId =
            scheduleId instanceof ScheduleId
                ? scheduleId
                : ScheduleId.fromString(scheduleId);

        return this;
    }

    /**
     * @override
     * @internal
     * @param {Channel} channel
     * @param {proto.IQuery} request
     * @returns {Promise<proto.IResponse>}
     */
    _execute(channel, request) {
        return channel.schedule.getScheduleInfo(request);
    }

    /**
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {proto.IResponseHeader}
     */
    _mapResponseHeader(response) {
        const scheduleGetInfo = /** @type {proto.IScheduleGetInfoResponse} */ (response.scheduleGetInfo);
        return /** @type {proto.IResponseHeader} */ (scheduleGetInfo.header);
    }

    /**
     * @override
     * @override
     * @internal
     * @param {proto.IResponse} response
     * @returns {Promise<ScheduleInfo>}
     */
    _mapResponse(response) {
        const info = /** @type {proto.IScheduleGetInfoResponse} */ (response.scheduleGetInfo);

        return Promise.resolve(
            ScheduleInfo._fromProtobuf(
                /** @type {proto.IScheduleInfo} */ (info.scheduleInfo)
            )
        );
    }

    /**
     * @override
     * @internal
     * @param {proto.IQueryHeader} header
     * @returns {proto.IQuery}
     */
    _onMakeRequest(header) {
        return {
            scheduleGetInfo: {
                header,
                scheduleID:
                    this._scheduleId != null
                        ? this._scheduleId._toProtobuf()
                        : null,
            },
        };
    }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
QUERY_REGISTRY.set("scheduleGetInfo", ScheduleInfoQuery._fromProtobuf);
