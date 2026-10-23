import ScheduleId from "../../src/schedule/ScheduleId.js";

describe("ScheduleId", function () {
    describe("fromString()", function () {
        it("should parse valid entity IDs", function () {
            expect(ScheduleId.fromString("0.0.123").toString()).to.equal(
                "0.0.123",
            );
            expect(ScheduleId.fromString("123").toString()).to.equal("0.0.123");
            expect(ScheduleId.fromString("1.2.3").toString()).to.equal("1.2.3");
            expect(ScheduleId.fromString("0.0.0123").toString()).to.equal(
                "0.0.123",
            );
            expect(ScheduleId.fromString("0.0.123-vfmkw").toString()).to.equal(
                "0.0.123",
            );
        });

        it("should throw when the entity number contains letters", function () {
            for (const text of ["0.0.12ab34", "0.0.ff", "0.0.5a", "0.0.1e3"]) {
                expect(() => ScheduleId.fromString(text)).to.throw(
                    `failed to parse entity id: ${text}`,
                );
            }
        });
    });
});
