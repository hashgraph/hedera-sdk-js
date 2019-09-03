export * from './index-web';

import {grpc} from "@improbable-eng/grpc-web";
import {NodeHttpTransport} from "@improbable-eng/grpc-web-node-http-transport";

grpc.setDefaultTransport(NodeHttpTransport());
