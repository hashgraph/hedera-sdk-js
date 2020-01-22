import * as grpc from "grpc";

export class MirrorClient {
    // NOT PART OF THE STABLE API
    public readonly _client: grpc.Client;

    public constructor(endpoint: string) {
        this._client = new grpc.Client(endpoint, grpc.credentials.createInsecure());
    }

    public close(): void {
        this._client.close();
    }
}
