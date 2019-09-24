/* eslint-env node */
const path = require("path");
const gulp = require("gulp");
const exec = require("gulp-exec");
const fs = require("fs-extra");
const webpack = require('webpack-stream');
const cp = require("child_process");
const named = require('vinyl-named');
const glob = require('glob');
const dtsGenerator = require("dts-generator");
const replace = require('gulp-replace');

gulp.task("build:webpack:web", () => {
    return gulp.src("index-web.ts")
        .pipe(named(() => "web"))
        .pipe(webpack({
            ...require("./webpack.config"),
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task("build:webpack:node", () => {
    return gulp.src("index-node.ts")
        .pipe(named(() => "node"))
        .pipe(webpack({
            target: "node",
            ...require("./webpack.config"),
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task("generate:flow", () => {
    return gulp.src("./dist/sdk.d.ts")
        .pipe(exec("flowgen -o ./dist/sdk.flow.js <%= file.path %>"));
});

gulp.task("generate:dts", () => {
    dtsGenerator.default({
        name: "@hashgraph/sdk",
        prefix: "@hashgraph/sdk",
        project: path.resolve(__dirname),
        baseDir: path.resolve(__dirname),
        main: "@hashgraph/sdk/index-web",
        out: "dist/sdk.d.ts",
        files: ["./index-web.ts"],
    });

    return gulp.src("./dist/sdk.d.ts")
        // HACK: Some external modules are not properly recognized
        // https://github.com/SitePen/dts-generator/issues/125
        .pipe(replace("@hashgraph/sdk/@improbable-eng/grpc-web", "@improbable-eng/grpc-web"))
        .pipe(replace("@hashgraph/sdk/bignumber.js", "bignumber.js"))
        .pipe(replace("@hashgraph/sdk/google-protobuf", "google-protobuf"))
        // No idea why the proto modules don't get resolved correctly
        .pipe(replace(/\.\/(.*)_pb/g, "@hashgraph/sdk/src/generated/$1_pb"))
        .pipe(gulp.dest('dist/'));
});

gulp.task("build:proto", (cb) => {
    // HACK: This depends on node_modules/
    let plugin = path.resolve(__dirname, "node_modules", ".bin", "protoc-gen-ts");

    if (process.platform === "win32") {
        // https://github.com/improbable-eng/ts-protoc-gen/issues/15#issuecomment-317063814
        plugin += ".cmd";
    }

    const out = path.resolve(__dirname, "src", "generated");
    const include = path.resolve(__dirname, "src", "proto");
    const files = glob.sync("src/proto/*.proto", { absolute: true }).join(" ");

    const cmd = "protoc " +
        `--plugin="protoc-gen-ts=${plugin}" ` +
        `--ts_out="service=grpc-web:${out}" ` +
        `--js_out="import_style=commonjs,binary:${out}" ` +
        `-I "${include}" ` +
        ` ${files}`;

    fs.ensureDirSync(out);

    cp.exec(cmd, (err, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.warn(stderr);

        cb(err);
    });
});

gulp.task("build", gulp.series(
    "build:proto",
    "build:webpack:node",
    "build:webpack:web",
    "generate:dts",
    "generate:flow"));
