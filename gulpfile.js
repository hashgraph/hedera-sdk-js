/* eslint-env node */
const path = require("path");
const gulp = require("gulp");
const exec = require("gulp-exec");
const fs = require("fs-extra");
const cp = require("child_process");
const glob = require('glob');
const ts = require('gulp-typescript');

const tsProject = ts.createProject("tsconfig.json", {
    declaration: true
});

gulp.task("build:tsc", () => {
    return gulp.src("src/**/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("lib/"));
});

gulp.task("generate:flow", () => {
    return gulp.src("lib/**/*.d.ts")
        .pipe(exec("flowgen -o <%= file.path.replace('.d.ts', '.flow.js') %> <%= file.path %>"));
});

gulp.task("copy:proto", () => {
    return gulp.src("src/generated/*", { base: 'src' })
        .pipe(gulp.dest("lib/"));
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
    "copy:proto",
    "build:tsc"));
