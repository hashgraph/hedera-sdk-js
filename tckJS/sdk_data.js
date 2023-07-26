exports.sdk = {
    client: null,
    getClient: function () {
        if (this.client == null) {
            throw "Client not setup"
        }
        return this.client;
    }
};
