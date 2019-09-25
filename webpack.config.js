const path = require("path");
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: "development",
    devtool: "source-map",
    output: {
        library: "sdk",
        libraryTarget: "umd",
        filename: "sdk.[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    externals: [nodeExternals()],
    node: {
        __dirname: true,
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
