'use strict';

/*
      ██████╗ ██╗   ██╗██╗     ██████╗
      ██╔════╝ ██║   ██║██║     ██╔══██╗
      ██║  ███╗██║   ██║██║     ██████╔╝
      ██║   ██║██║   ██║██║     ██╔═══╝
      ╚██████╔╝╚██████╔╝███████╗██║
      ╚═════╝  ╚═════╝ ╚══════╝╚═╝
 */

// module import
const gulp = require('gulp');
const browserSync = require('browser-sync');
const dateUtils = require('date-utils'); // 日付をフォーマット
const insert = require('gulp-insert'); // 挿入
const plumber = require('gulp-plumber'); // エラー起きても止まらない
const pug = require('gulp-pug'); // 可愛いパグを処理するやつ
const fileinclude = require('gulp-file-include'); // file include 使いたい時のために一応置いとく
const runSequence = require('run-sequence'); // タスクの処理順序の担保
const imagemin = require('gulp-imagemin'); // 画像圧縮
const sass = require('gulp-sass'); // sass!!!
const sassGlob = require('gulp-sass-glob'); // sass!!!
const sourcemaps = require('gulp-sourcemaps'); // sassのソースマップ吐かせる
const please = require('gulp-pleeease'); // sass周りのいろいろ
const webpack = require('webpack'); // js関係のことを今回やらせます。
const webpackStream = require('webpack-stream'); // webpack2をつかうためのもの
const webpackConfig = require('./webpack.config.js'); // webpackの設定ファイル
const minimist = require('minimist'); // タスク実行時に引数を渡す
const del = require('del'); // clean task用
const DirectoryManager = require('./DirectoryManager.js'); // directory 共通化用

const DIR = DirectoryManager();
const HTML_TASK = 'fileinclude'; // pug or fileinclude

// *********** COMMON METHOD ***********

// 実行時の引数取得
const args = minimist(process.argv.slice(2));

// 現在時刻の取得
const fmtdDate = new Date().toFormat('YYYY-MM-DD HH24MISS');

// clean
let cleanDIR;
gulp.task('clean', cb => {
  // if(args.clean) return del([cleanDIR], cb);
  // return cb();
  return del([cleanDIR], cb);
});

// *********** DEVELOPMENT TASK ***********

// browserSync
gulp.task('browserSync', ()=> {
  browserSync.init({
    server: {
      baseDir: DIR.dest
    },
    ghostMode: {
      clicks: true,
      forms: true,
      scroll: false
    }
  });
});

// sass
gulp.task('sass', ()=> {
  return gulp.src(DIR.src_assets + 'sass/**/*.{sass,scss}')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sassGlob())
    .pipe(sass({
      includePaths: 'node_modules/tokyo-shibuya-reset',
      outputStyle: ':expanded'
    })
    .on('error', sass.logError))
    .pipe(please({
      sass: false,
      minifier: false,
      rem: false,
      pseudoElements: false,
      mqpacker: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DIR.dest_assets + 'css/'))
    .pipe(browserSync.stream());
});

// js
gulp.task('scripts', () => {
  return gulp.src(DIR.src_assets + 'js/**/*.')
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig.dev, webpack))
    .pipe(gulp.dest(DIR.dest_assets + 'js'))
    .pipe(browserSync.stream());
});

// html include
gulp.task('fileinclude', ()=> {
  return gulp.src([DIR.src + '**/*.html', '!' + DIR.src + '_inc/**/*.html'])
    .pipe(plumber())
    .pipe(fileinclude({
      prefix: '@@',
      basepath: 'app/src/_inc'
    }))
    .pipe(gulp.dest(DIR.dest))
    .pipe(browserSync.stream());
});

// pug
gulp.task('pug', ()=> {
  gulp.src([DIR.src + '**/*.pug', '!' + DIR.src + '_inc/', '!' + DIR.src + '_inc/**/*.pug'])
    .pipe(plumber())
    .pipe(pug({
      pretty: true,
      basedir: DIR.src
    }))
    .pipe(gulp.dest(DIR.dest))
    .pipe(browserSync.stream());
});

// imageMin
gulp.task('imageMin', ()=> {
  return gulp.src(DIR.src_assets + 'img/**/*')
    .pipe(imagemin(
      [
        imagemin.gifsicle({
          optimizationLevel: 3,
          interlaced: true
        }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({ removeViewBox: false })
      ],
      { verbose: true }
    ))
    .pipe(gulp.dest(DIR.dest_assets + 'img/'))
    .pipe(browserSync.stream());
});

// watch
gulp.task('watch', ()=> {
  const htmlExpanded = (HTML_TASK === 'pug') ? 'pug' : 'html';
  gulp.watch(DIR.src + '**/*.' + htmlExpanded, [HTML_TASK]);
  gulp.watch(DIR.src_assets + 'sass/**/*.{sass,scss}', ['sass']);
  gulp.watch(DIR.src_assets + 'js/**/*.', ['scripts']);
});

// only build
gulp.task('build', ()=> {
  cleanDIR = DIR.dest;
  runSequence(
    'clean',
    [HTML_TASK, 'scripts', 'sass', 'imageMin']
  );
});

// default
gulp.task('default', ()=> {
  cleanDIR = DIR.dest;
  runSequence(
    'clean',
    [HTML_TASK, 'scripts', 'sass', 'imageMin'],
    'browserSync',
    'watch'
  );
});

// *********** RELEASE TASK ***********

// css
gulp.task('release_CSS', ()=> {
  return gulp.src(DIR.dest_assets + 'css/*.css')
  .pipe(please({
    sass: false,
    minifier: true,
    rem: false,
    pseudoElements: false
  }))
  .pipe(insert.prepend('/*! compiled at:' + fmtdDate + ' */\n'))
  .pipe(gulp.dest(DIR.release_assets + 'css/'));
});

// js conat
gulp.task('release_JS', () => {
  return webpackStream(webpackConfig.prod, webpack)
  .pipe(gulp.dest(DIR.release_assets + 'js'));
});

// releaesへcopy
gulp.task('release_COPY', ()=> {
  // img
  gulp.src(DIR.dest_assets + 'img/**/*.{jpg,png,gif,svg,ico}')
  .pipe(gulp.dest(DIR.release_assets + 'img/'));
  // html
  gulp.src(DIR.dest + '**/*.html')
  .pipe(gulp.dest(DIR.release));
});

// for release
gulp.task('release', ()=>{
  cleanDIR = DIR.release;
  runSequence(
    'clean',
    ['release_CSS', 'release_JS', 'release_COPY']
  );
});
