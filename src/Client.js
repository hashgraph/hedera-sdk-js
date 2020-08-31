import Channel from "./Channel";

export default class Client {
    constructor() {
        this.channel = new Channel("1.testnet.hedera.com:50211");
    }
}
