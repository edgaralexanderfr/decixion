const fs = require('fs');
const { series, src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const header = require('gulp-header');
const replace = require('gulp-replace');

const HEADER =
    '/**\n' +
    ' * Decixion Engine\n' +
    ' *\n' +
    ' * Version: 0.4.0\n' +
    ' * MIT License\n' +
    ' * Copyright (c) 2020 Edgar Alexander Franco\n' +
    ' */\n';

function copyFiles(cb) {
    src('src/game.js')
        .pipe(dest('dist'));

    src('src/index.html')
        .pipe(replace('decixion.js', 'decixion.min.js'))
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

function renameMinified(cb) {
    fs.rename('dist/decixion.js', 'dist/decixion.min.js', function (err) {
        if (err) {
            throw err;
        }

        cb();
    });
}

exports.build = series(copyFiles, uglifyEngine, prependHeader, renameMinified);
exports.default = series(copyFiles, uglifyEngine, prependHeader, renameMinified);
