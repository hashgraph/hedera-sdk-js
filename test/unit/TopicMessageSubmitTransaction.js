import TopicMessageSubmitTransaction from "../src/topic/TopicMessageSubmitTransaction.js";
import * as utf8 from "../src/encoding/utf8.js";
import * as util from "../src/util.js";

describe("TopicMessageSubmitTransaction", function () {
    it("setMessage should throw error when passed no message", function () {
        const topicMessageSubmitTransaction =
            new TopicMessageSubmitTransaction();

        try {
            topicMessageSubmitTransaction.setMessage();
        } catch (error) {
            expect(error.message).to.eql(util.REQUIRE_NON_NULL_ERROR);
        }
    });

    it("setMessage should throw error when passed non string/Uint8Array message", function () {
        const message = { message: "this is a message" };

        const topicMessageSubmitTransaction =
            new TopicMessageSubmitTransaction();

        try {
            topicMessageSubmitTransaction.setMessage(message);
        } catch (error) {
            expect(error.message).to.eql(
                util.REQUIRE_STRING_ERROR || util.REQUIRE_UINT8ARRAY_ERROR
            );
        }
    });

    it("setMessage should not throw error when passed valid message", function () {
        const message = "this is a message";

        const topicMessageSubmitTransaction =
            new TopicMessageSubmitTransaction();

        topicMessageSubmitTransaction.setMessage(message);

        expect(utf8.decode(topicMessageSubmitTransaction.message)).to.eql(
            message
        );
    });
});
