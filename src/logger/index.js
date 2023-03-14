import Logger from "./MyLogger.js";

const logger = new Logger();
logger.info("test");
console.log(logger.level);
logger.setLevel("warn")
console.log(logger.level);