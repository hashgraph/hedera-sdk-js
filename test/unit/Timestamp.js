import { Timestamp } from "../../src/index.js";

describe("Timestamp", function () {
    it("plusNanos works correctly", async function () {
        let timestamp = new Timestamp(0, 999999998);

        expect(timestamp.seconds.toInt()).to.be.eql(0);
        expect(timestamp.nanos.toInt()).to.be.eql(999999998);

        timestamp = timestamp.plusNanos(1);

        expect(timestamp.seconds.toInt()).to.be.eql(0);
        expect(timestamp.nanos.toInt()).to.be.eql(999999999);

        timestamp = timestamp.plusNanos(1);

        expect(timestamp.seconds.toInt()).to.be.eql(1);
        expect(timestamp.nanos.toInt()).to.be.eql(0);

        timestamp = timestamp.plusNanos(1);

        expect(timestamp.seconds.toInt()).to.be.eql(1);
        expect(timestamp.nanos.toInt()).to.be.eql(1);
    });

    it("fromDate()", function () {
        let timestamp = Timestamp.fromDate(999999998);

        expect(timestamp.seconds.toInt()).to.be.eql(0);
        expect(timestamp.nanos.toInt()).to.be.eql(999999998);
    });
});
