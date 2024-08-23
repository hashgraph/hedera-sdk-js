import express from "express";
import bodyParser from "body-parser";
import {
    JSONRPCParams,
    JSONRPCRequest,
    JSONRPCServer,
    SimpleJSONRPCMethod,
    createJSONRPCErrorResponse,
} from "json-rpc-2.0";

import * as methods from "./methods";
import mapping from "./mapping";
import { RpcMethodParams } from "./params/sdk";

const server = new JSONRPCServer();

// Helper function to register methods
const registerMethods = (
    methodsObject: Record<string, string>,
    prefix = "",
) => {
    Object.entries(methodsObject).forEach(([methodName, method]) => {
        if (methodName === "default" && typeof method === "object") {
            // Recursively register methods inside the `default` property
            registerMethods(method, prefix);
        } else {
            // Register the method with the correct prefix
            const fullMethodName = prefix
                ? `${prefix}.${methodName}`
                : methodName;

            server.addMethod(
                fullMethodName,
                method as unknown as SimpleJSONRPCMethod<void>,
            );
        }
    });
};

// Register all methods, handling possible nested default export
if ("default" in methods) {
    registerMethods(methods.default);
} else {
    registerMethods(methods);
}

// Create mapping server method
server.addMethod(
    "mapping",
    async (...args: [params: RpcMethodParams, serverParams?: void]) => {
        // Basic mapping for unimplemented functions
        return await mapping(args[0]);
    },
);

/**
 * Middleware to handle exceptions and customize error responses
 */
const exceptionMiddleware = async (
    next: SimpleJSONRPCMethod,
    request: JSONRPCRequest,
    serverParams: JSONRPCParams,
) => {
    try {
        return await next(request, serverParams);
    } catch (error) {
        if (error.status && error.status._code) {
            return createJSONRPCErrorResponse(
                request.id,
                -32001,
                "Hedera Error",
                {
                    status: error.status.toString(),
                    message: error.message,
                },
            );
        } else {
            let parsedError: Error;

            // Attempt to retrieve error information if it's in a different format.
            try {
                parsedError = JSON.parse(error.toString().substring(7));
            } catch (error) {
                return;
            }

            return createJSONRPCErrorResponse(
                request.id,
                -32603,
                "Internal error",
                {
                    ...parsedError,
                    message: error.message || error,
                },
            );
        }
    }
};

// Apply middleware to handle exceptions
server.applyMiddleware(exceptionMiddleware);

// Set up the Express server
const app = express();
app.use(bodyParser.json());

app.post("/", (req, res) => {
    const jsonRPCRequest = req.body;
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            res.sendStatus(204);
        }
    });
});

let port = 80; // Default port
const args = process.argv.slice(2);
if (args.length > 0) {
    try {
        port = parseInt(args[0]);
    } catch (err) {
        console.warn("Port args error! Defaulting to port 80");
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

console.log("-- JSON-RPC JS server running on localhost port " + port);
