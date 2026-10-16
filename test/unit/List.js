import List from "../../src/transaction/List.js";

describe("List", function () {
    describe("setList()", function () {
        it("replaces the items and resets the index", function () {
            const list = new List().setList(["a", "b", "c"]);
            list.advance();
            list.advance();
            expect(list.index).to.equal(2);

            const result = list.setList(["x", "y"]);
            expect(result).to.equal(list);
            expect(list.list).to.deep.equal(["x", "y"]);
            expect(list.index).to.equal(0);
        });
    });

    describe("push()", function () {
        it("appends items to the end", function () {
            const list = new List().setList(["a"]);

            const result = list.push("b", "c");
            expect(result).to.equal(list);
            expect(list.list).to.deep.equal(["a", "b", "c"]);
        });
    });

    describe("get(),length and isEmpty", function () {
        it("reads items by index", function () {
            const list = new List().setList(["a", "b"]);

            expect(list.get(0)).to.equal("a");
            expect(list.get(1)).to.equal("b");
            expect(list.get(2)).to.be.undefined;
        });

        it("returns length and isEmpty", function () {
            const list = new List();

            expect(list.length).to.equal(0);
            expect(list.isEmpty).to.be.true;

            list.push("a");
            expect(list.length).to.equal(1);
            expect(list.isEmpty).to.be.false;
        });
    });

    describe("set()", function () {
        it("overwrites an existing index", function () {
            const list = new List().setList(["a", "c"]);
            const result = list.set(0, "s");

            expect(result).to.equal(list);
            expect(list.list).to.deep.equal(["s", "c"]);
        });

        it("appends when the index equals the length", function () {
            const list = new List().setList(["a", "b"]);
            list.set(2, "c");
            expect(list.list).to.deep.equal(["a", "b", "c"]);
            expect(list.length).to.equal(3);
        });
    });

    describe("setIfAbsent()", function () {
        it("fills an empty slot and calls lambda once", function () {
            const list = new List().setList(["a", "b"]);
            let calls = 0;
            list.setIfAbsent(2, () => {
                calls++;
                return "c";
            });
            list.list[3] = undefined;
            list.setIfAbsent(3, () => {
                calls++;
                return "d";
            });
            expect(list.list).to.deep.equal(["a", "b", "c", "d"]);
            expect(calls).to.equal(2);
        });

        it("fills a null slot", function () {
            const list = new List().setList(["a", null]);

            list.setIfAbsent(1, () => "b");

            expect(list.list).to.deep.equal(["a", "b"]);
        });
        it("does not call the lambda or overwrite when the slot is filled", function () {
            const list = new List().setList(["a", "b"]);
            let calls = 0;

            const result = list.setIfAbsent(0, () => {
                calls++;
                return "z";
            });

            expect(result).to.equal(list);
            expect(calls).to.equal(0);
            expect(list.list).to.deep.equal(["a", "b"]);
        });
    });
    describe("round robin", function () {
        it("next returns the items in order and wraps around", function () {
            const list = new List().setList(["a", "b", "c"]);

            expect(list.next).to.equal("a");
            expect(list.next).to.equal("b");
            expect(list.next).to.equal("c");
            expect(list.next).to.equal("a");
        });

        it("current returns the current item without advancing", function () {
            const list = new List().setList(["a", "b"]);

            expect(list.current).to.equal("a");
            expect(list.current).to.equal("a");
            expect(list.index).to.equal(0);

            list.advance();

            expect(list.current).to.equal("b");
            expect(list.index).to.equal(1);
        });

        it("advance() returns the old index and wraps the new one", function () {
            const list = new List().setList(["a", "b"]);

            expect(list.advance()).to.equal(0);
            expect(list.index).to.equal(1);
            expect(list.advance()).to.equal(1);
            expect(list.index).to.equal(0);
        });
    });

    describe("setLocked()", function () {
        it("makes setList() and push() throw", function () {
            const list = new List().setList(["a"]);

            const result = list.setLocked();

            expect(result).to.equal(list);
            expect(list.locked).to.be.true;
            expect(() => list.setList(["b"])).to.throw("list is locked");
            expect(() => list.push("b")).to.throw("list is locked");
            expect(list.list).to.deep.equal(["a"]);
        });

        it("does not make set() throw on a locked list", function () {
            const list = new List().setList(["a", "b"]).setLocked();

            expect(() => list.set(0, "z")).to.not.throw();
            expect(() => list.set(2, "c")).to.not.throw();
            expect(list.list).to.deep.equal(["z", "b", "c"]);
        });

        it("does not make setIfAbsent() throw on a locked list", function () {
            const list = new List().setList(["a"]).setLocked();

            expect(() => list.setIfAbsent(1, () => "b")).to.not.throw();
            expect(() => list.setIfAbsent(0, () => "z")).to.not.throw();
            expect(list.list).to.deep.equal(["a", "b"]);
        });
    });

    describe("clear()", function () {
        it("empties the list, resets the index and unlocks it", function () {
            const list = new List().setList(["a", "b"]);
            list.advance();
            list.setLocked();

            list.clear();

            expect(list.list).to.deep.equal([]);
            expect(list.isEmpty).to.be.true;
            expect(list.index).to.equal(0);
            expect(list.locked).to.be.false;
            expect(() => list.push("a")).to.not.throw();
        });
    });

    describe("clone()", function () {
        it("is shallow: shares the array, copies locked, resets index", function () {
            const original = new List().setList(["a", "b", "c"]);
            original.advance();
            original.advance();
            original.setLocked();

            const clone = original.clone();

            expect(clone).to.not.equal(original);
            expect(clone.list).to.equal(original.list);
            expect(clone.locked).to.be.true;
            expect(clone.index).to.equal(0);
            expect(original.index).to.equal(2);
        });

        it("reflects changes to the shared array in both lists", function () {
            const original = new List().setList(["a"]);
            const clone = original.clone();

            original.push("b");

            expect(clone.list).to.deep.equal(["a", "b"]);
        });
    });
});
