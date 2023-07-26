const glob = require("glob");
const path = require("path");

// require all files in this folder in one module.export

let allMethods = {};
glob.sync(__dirname.split(path.sep).join(path.posix.sep) + '/**/*.js').forEach((file) => {
    allMethods = {...allMethods, ...require(path.resolve(file))};
});

module.exports = allMethods;


