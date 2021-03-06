const gulp = require('gulp');
// const gulpThrough = require('through2');
const gulpSequence = require('gulp-sequence');
// const gulpMerge = require('merge2');

// const gulpConcat = require('gulp-concat');
// const gulpWrap = require('gulp-wrapper');
// const gulpUglify = require('gulp-uglify');
// const gulpSourcemaps = require('gulp-sourcemaps');
const gulpDel = require('del');

const browserify = require('browserify');
const browserSync = require('browser-sync').create();

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const shell = require('shelljs');
// const Fs = require('fs');
// const Path = require('path');
const packageFile = require('./package.json');

const app = {
  version: packageFile.version + '-' + shell.exec('git rev-parse HEAD', {silent:true}).replace(/\n$/, "")
};

const destDir = 'dist/';

gulp.task('clean', function () {
    return gulpDel([destDir]);
});

gulp.task('serve', ['build'], function () {

    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });
    gulp.watch('app/**/*', ['build']);
    gulp.watch('dist/**/*').on('change', browserSync.reload);
});

gulp.task('build', ['clean'], function (callback) {
    gulpSequence(
        [
            'copy-resources',
            'build-css',
            'build-js',
            'build-html'
        ],
        callback);
});

gulp.task('build-js', function () {
     return browserify({
            entries: [
             'app/index.js'
            ],
            insertGlobalVars: {
              app: function () { return JSON.stringify(app)} 
            },
            transform: [
                  "packageify",
                  "brfs"
            ]
        })
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(destDir));
});

gulp.task('build-html', function () {
    return gulp.src('app/**/*.html')
        .pipe(gulp.dest(destDir + '/'));
});

gulp.task('build-css', function () {
    return gulp.src('app/**/*.css')
        .pipe(gulp.dest(destDir + '/'));
});

gulp.task('copy-resources', function () {
    return gulp.src(['app/favicon.ico', 'app/*.png'])
        .pipe(gulp.dest(destDir + '/'));
});
