import Logger from "js-logger";

export * from "./exports.js";

export { default as LocalProvider } from "./LocalProvider.js";
export { default as Client } from "./client/NodeClient.js";

if (
    process != null &&
    process.env != null &&
    process.env.HEDERA_SDK_LOG_LEVEL != null
) {
    Logger.useDefaults();

    switch (process.env.HEDERA_SDK_LOG_LEVEL) {
        case "DEBUG":
            Logger.setLevel(Logger.DEBUG);
            break;
        case "TRACE":
            Logger.setLevel(Logger.TRACE);
            break;
        case "WARN":
            Logger.setLevel(Logger.WARN);
            break;
        case "INFO":
            Logger.setLevel(Logger.INFO);
            break;
    }
}
