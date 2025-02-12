const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
    },

    module: {
        rules: [
            {
                // If you see a file that ends in .html, send it to these loaders.
                test: /\.js$/,
            },
        ],
    },
    optimization: {
        usedExports: true,
        sideEffects: true,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        dead_code: true,
                    },
                },
            }),
        ],
    },
    plugins: [
        new BundleAnalyzerPlugin({
            generateStatsFile: true,
        }),
    ],
};
