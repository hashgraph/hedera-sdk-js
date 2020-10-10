export class MirrorClient {
    public readonly endpoint: string;

    public constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public close(): void {
        console.warn("Close is not implememented for the web version of `MirrorClient`");
    }
}
