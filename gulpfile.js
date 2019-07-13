const { src, dest, parallel } = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const inject = require('gulp-inject-string');

function LazyScript() {
  return src(['src/LazyScript.js'])
    .pipe(rename('lazyscript.js'))
    .pipe(dest('dist/'))
    .pipe(inject.append('\nLazyScript.config({"suffix":".min"});\n'))
    .pipe(uglify())
    .pipe(rename('lazyscript.min.js'))
    .pipe(dest('dist/'));
}

function LazyScriptJquery() {
  return src(['node_modules/jquery/dist/jquery.js', 'src/LazyScript.js'])
    .pipe(concat('lazyscript.jquery.min.js'))
    .pipe(inject.append('\nLazyScript.config({"preload":"jquery","suffix":".min"});\n'))
    .pipe(uglify())
    .pipe(dest('dist/'));
}

function mainjs() {
  return src(['src/main.js'])
    .pipe(dest('dist/'));
}

exports.default = parallel(LazyScript, LazyScriptJquery, mainjs);
