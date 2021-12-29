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
     * @param {boolean=} isSetByUser
     * @returns {this}
     */
    setList(list, isSetByUser = false) {
        this.list = list;
        this.isSetByUser = isSetByUser;
        this.index = 0;

        return this;
    }

    /**
     * @param {number} index
     * @returns {T}
     */
    get(index) {
        if (index > this.list.length) {
            throw new Error(
                `index ${index} out of bounds for list of length ${this.list.length}`
            );
        }

        return this.list[index];
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
