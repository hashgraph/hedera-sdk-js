import { TransactionId, AccountId } from "../../../src/exports";

describe("TransactionId", () => {
    it("produces monotonically increasing timestamps", () => {
        const account = new AccountId(0, 0, 2);
        let last = new TransactionId(account).validStart;
        for (let i = 0; i < 100; i += 1) {
            const time = new TransactionId(account).validStart;
            expect(time.seconds < last.seconds || (time.seconds === last.seconds && time.nanos <= last.nanos)).toBeFalsy();
            last = time;
        }
    });
});