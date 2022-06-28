import { syncFunction } from "../../src/sync.js";

describe("sync", function () {
    it("is able to fetch HEAD", async function () {
        await syncFunction();
    });
});
