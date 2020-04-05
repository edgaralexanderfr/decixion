const { series, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const header = require('gulp-header');

const HEADER =
    '/**\n' +
    ' * Decixion Engine\n' +
    ' *\n' +
    ' * Version: 0.2.1\n' +
    ' * MIT License\n' +
    ' * Copyright (c) 2020 Edgar Alexander Franco\n' +
    ' */\n';

function copyFiles(cb) {
    src('src/game.js')
        .pipe(dest('dist'));

    src('src/index.html')
        .pipe(dest('dist'));

    cb();
}

function uglifyEngine() {
    return src('src/decixion.js')
        .pipe(uglify())
        .pipe(dest('dist'));
}

function prependHeader() {
    return src('dist/decixion.js')
        .pipe(header(HEADER))
        .pipe(dest('dist'));
}

exports.build = series(copyFiles, uglifyEngine, prependHeader);
exports.default = series(copyFiles, uglifyEngine, prependHeader);
