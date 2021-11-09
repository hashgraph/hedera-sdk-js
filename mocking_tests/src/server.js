import * as grpc from "grpc";
import * as loader from "@grpc/proto-loader";

export const ABORTED = {
    name: "ABORTED",
    message: "no response found",
    code: 10,
};
export const UNAVAILABLE = {
    name: "UNAVAILABLE",
    message: "node is UNAVAILABLE",
    code: 14,
};

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").Response} proto.Response
 * @typedef {import("@hashgraph/proto").Query} proto.Query
 * @typedef {import("@hashgraph/proto").TransactionResponse} proto.TransactionResponse
 */

/**
 * @typedef {object} Response
 * @property {proto.Response | proto.TransactionResponse} [response]
 * @property {grpc.ServiceError} [error]
 */

export default class GrpcServer {
    /**
     * @param {string | string[]} paths
     * @param {string} name
     */
    constructor(paths, name) {
        this.server = new grpc.Server();

        this.package = /** @type {grpc.GrpcObject} */ (
            grpc.loadPackageDefinition(loader.loadSync(paths))[name]
        );
    }

    /**
     * Adds a service to the gRPC server
     *
     * @param {Response[]} responses
     * @returns {this}
     */
    addResponse(responses) {
        let services = [];

        for (const [key, value] of Object.entries(this.package)) {
            if (typeof value === "function") {
                const service =
                    /** @type {grpc.ServiceDefinition<grpc.UntypedServiceImplementation>} */ (
                        /** @type {grpc.GrpcObject} */ (this.package[key])[
                            "service"
                        ]
                    );
                services.push(service);
            }
        }

        /** @type {grpc.UntypedServiceImplementation} */
        const router = {};

        let index = 0;

        for (const service of services) {
            for (const key of Object.keys(service)) {
                // eslint-disable-next-line ie11/no-loop-func
                router[key] = /** @type {grpc.handleUnaryCall<any, any>} */ (
                    _,
                    callback
                ) => {
                    const response = responses[index];

                    if (response == null) {
                        callback(ABORTED, null);
                    }

                    const value = response.response;
                    const error =
                        response.error != null
                            ? response.error
                            : value == null
                            ? ABORTED
                            : null;

                    callback(error, value);

                    index += 1;
                };
            }

            this.server.addService(service, router);
        }

        return this;
    }

    /**
     * @param {string} port
     * @param {grpc.ServerCredentials} creds
     * @returns {this}
     */
    listen(port, creds = grpc.ServerCredentials.createInsecure()) {
        this.server.bind(port, creds);
        this.server.start();
        return this;
    }

    /**
     * @param {boolean} force
     * @param {() => void} callback
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close(force = false, callback = () => {}) {
        if (force) {
            this.server.forceShutdown();
        } else {
            this.server.tryShutdown(callback);
        }
    }
}
