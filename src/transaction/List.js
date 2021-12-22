/**
 * @template {any} T
 */
export default class List {
    constructor() {
        /** @type {T[]} */
        this.list = [];

        this.isSetByUser = false;
    }

    /**
     * @param {T[]} list
     * @param {boolean=} isSetByUser
     * @returns {this}
     */
    setList(list, isSetByUser = false) {
        this.list = list;
        this.isSetByUser = isSetByUser;
        return this;
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
