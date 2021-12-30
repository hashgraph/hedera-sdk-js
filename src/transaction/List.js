/**
 * @template {any} T
 */
export default class List {
    constructor() {
        /** @type {T[]} */
        this.list = [];
        this.locked = false;
        this.index = 0;
    }

    /**
     * @param {T[]} list
     * @param {boolean=} locked
     * @returns {this}
     */
    setList(list, locked = false) {
        if (this.locked && !locked) {
            throw new Error("attempting to override transaction IDs");
        }

        this.list = list;
        this.locked = locked;
        this.index = 0;

        return this;
    }

    /**
     * @param {number} index
     * @returns {T}
     */
    get(index) {
        return this.list[index % this.list.length];
    }

    /**
     * @returns {T}
     */
    get next() {
        return this.get(this.advance());
    }

    /**
     * @returns {number}
     */
    advance() {
        const index = this.index;
        this.index = (this.index + 1) % this.list.length;
        return index;
    }

    /**
     * @returns {boolean}
     */
    get isEmpty() {
        return this.length === 0;
    }

    /**
     * @returns {number}
     */
    get length() {
        return this.list.length;
    }
}
