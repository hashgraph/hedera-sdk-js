const path = require("path");

module.exports = {
    mode: "production",
    output: {
        library: "sdk",
        libraryTarget: "umd",
        filename: "sdk.[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            }
        ]
    }
};
