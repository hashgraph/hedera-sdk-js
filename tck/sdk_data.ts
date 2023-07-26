export const sdk = {
    client: null,
    getClient(): any {
      if (this.client == null) {
        throw new Error("Client not set up");
      }
      return this.client;
    },
  };
  