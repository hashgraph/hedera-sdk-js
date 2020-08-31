import AccountId from "../src/account/AccountId";

describe("AccountId", function () {
    it("should construct from (shard, realm, num)", function () {
        const accountId = new AccountId(10, 50, 25050);

        expect(accountId.num).to.eql(25050);
        expect(accountId.realm).to.eql(50);
        expect(accountId.shard).to.eql(10);
    });

    it("should construct from (num)", function () {
        const accountId = new AccountId(25050);

        expect(accountId.num).to.eql(25050);
        expect(accountId.realm).to.eql(0);
        expect(accountId.shard).to.eql(0);
    });

    it("should parse {shard}.{realm}.{num}", function () {
        const accountId = AccountId.fromString("10.50.25050");

        expect(accountId.num).to.eql(25050);
        expect(accountId.realm).to.eql(50);
        expect(accountId.shard).to.eql(10);
    });

    it("should parse {num}", function () {
        const accountId = AccountId.fromString("25050");

        expect(accountId.num).to.eql(25050);
        expect(accountId.realm).to.eql(0);
        expect(accountId.shard).to.eql(0);
    });

    it("should stringify to {shard}.{realm}.{num}", function () {
        expect(new AccountId(50, 150, 520).toString()).to.eql("50.150.520");
    });
});
