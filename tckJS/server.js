const express = require("express");
const bodyParser = require("body-parser");
const {JSONRPCServer, createJSONRPCErrorResponse} = require("json-rpc-2.0");
const methods = require("./methods")
const mapping = require("./mapping");

const server = new JSONRPCServer();

// Create json-rpc server method for each method
Object.entries(methods).forEach(([methodName, method]) => {
    // First parameter is a method name.
    // Second parameter is a method itself.
    // A method takes JSON-RPC params and returns a result.
    // It can also return a promise of the result.
    server.addMethod(methodName, method)
});

// Create mapping server method
server.addMethod("mapping", async (...args) => {
    // Basic mapping for unimplemented functions
    return await mapping(args[0])
})


/**
 * Set ErrorResponse code to error.status._code if available
 */
const exceptionMiddleware = async (next, request, serverParams) => {
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
                    message: error.message
                }
            );
        } else {
            return createJSONRPCErrorResponse(
                request.id,
                -32603,
                "Internal error",
                {
                    message: error.message || error
                }
            );
        }
    }
};
// Middleware will be called in the same order they are applied
server.applyMiddleware(exceptionMiddleware);

const app = express();
app.use(bodyParser.json());

app.post("/", (req, res) => {
    const jsonRPCRequest = req.body;
    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    // It can also receive an array of requests, in which case it may return an array of responses.
    // Alternatively, you can use server.receiveJSON, which takes JSON string as is (in this case req.body).
    server.receive(jsonRPCRequest).then((jsonRPCResponse) => {
        if (jsonRPCResponse) {
            res.json(jsonRPCResponse);
        } else {
            // If response is absent, it was a JSON-RPC notification method.
            // Respond with no content status (204).
            res.sendStatus(204);
        }
    });
});
let port = 80 // Default port
let args = process.argv.slice(2);
if (args.length > 0) {
    try {
        port = parseInt(args[0]);
    } catch (err) {
        console.warn("Port args error! Defaulting to port 80")
    }
}
app.listen(port);
console.log("-- JSON-RPC JS server running on localhost port " + port)
