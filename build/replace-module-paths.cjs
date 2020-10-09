// ensure that all local imports go from .js to .cjs when moved to lib/
// https://github.com/liady/babel-plugin-module-rewrite
module.exports = function replaceImport(originalPath, callingFileName, options) {
    if (originalPath.startsWith(".") && originalPath.endsWith(".js")) {
        return originalPath.replace(".js", ".cjs");
    }

    return originalPath;
}
