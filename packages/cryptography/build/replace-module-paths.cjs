// ensure that all local imports go from .js to .cjs when moved to lib/
// https://github.com/liady/babel-plugin-module-rewrite
module.exports = function replaceImport(originalPath, callingFileName, options) {
    let path = originalPath;

    if (global.process != null && global.process.env != null && global.process.env.HEDERA_SDK_TEST != null) {
        if (
            originalPath.startsWith(".") && 
            originalPath.endsWith(".js") &&
            !callingFileName.includes("/test/") &&
            path.includes("/src/")
        ) {
            path = path.replace(".js", ".cjs");
            path = path.replace("src/", "lib/");
        }
    } else {
        if (path.startsWith(".") && path.endsWith(".js")) {
            path = path.replace(".js", ".cjs");
        }
    }

    return path;
}
