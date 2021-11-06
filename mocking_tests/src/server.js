import * as grpc from "grpc";
import * as loader from "@grpc/proto-loader";

const ABORTED = { name: "ABORTED", message: "no response found", code: 10 };

/**
 * @typedef {object} Response
 * @property {any} [response]
 * @property {any} [error]
 */

/**
 * @namespace {proto}
 * @typedef {import("@hashgraph/proto").Response} proto.Response
 * @typedef {import("@hashgraph/proto").Query} proto.Query
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
     * @param {string} name
     * @param {Response[]} responses
     * @returns {this}
     */
    addService(name, responses) {
        const service =
            /** @type {grpc.ServiceDefinition<grpc.UntypedServiceImplementation>} */ (
                /** @type {grpc.GrpcObject} */ (this.package[name])["service"]
            );

        // console.log(Object.keys(service));

        /** @type {grpc.UntypedServiceImplementation} */
        const router = {};

        let index = 0;

        for (const key of Object.keys(service)) {
            router[key] = /** @type {grpc.handleUnaryCall<any, any>} */ (
                    _,
                    callback
                ) => {
                    if (responses[index] != null && responses[index].response != null) {
                        callback(null, responses[0].response);
                    } else if (responses[index] != null && responses[index].error != null) {
                        callback(responses[0].error, null);
                    } else {
                        callback(ABORTED , null);
                    }

                    index += 1;
                };
        }


        this.server.addService(service, router);
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
    close(force = false, callback = () => {}) {
        if (force) {
            this.server.forceShutdown();
        } else {
            this.server.tryShutdown(callback);
        }
    }
}
