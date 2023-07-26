import express from "express";
import bodyParser from "body-parser";
import { JSONRPCServer, createJSONRPCErrorResponse } from "json-rpc-2.0";
import * as methods from "./methods";
import mapping from "./mapping";

const server = new JSONRPCServer();

// Create json-rpc server method for each method
Object.entries(methods).forEach(([methodName, method]) => {
  server.addMethod(methodName, method);
});

// Create mapping server method
server.addMethod("mapping", async (...args: any[]) => {
  // Basic mapping for unimplemented functions
  return await mapping(args[0]);
});

/**
 * Set ErrorResponse code to error.status._code if available
 */
const exceptionMiddleware = async (next: any, request: any, serverParams: any) => {
  try {
    return await next(request, serverParams);
  } catch (error: any) {
    if (error.status && error.status._code) {
      return createJSONRPCErrorResponse(
        request.id,
        -32001,
        "Hedera Error",
        {
          status: error.status.toString(),
          message: error.message,
        }
      );
    } else {
      return createJSONRPCErrorResponse(
        request.id,
        -32603,
        "Internal error",
        {
          message: error.message || error,
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

let port = 80; // Default port
const args = process.argv.slice(2);
if (args.length > 0) {
  try {
    port = parseInt(args[0]);
  } catch (err) {
    console.warn("Port args error! Defaulting to port 80");
  }
}

app.listen(port);
console.log("-- JSON-RPC JS server running on localhost port " + port);
