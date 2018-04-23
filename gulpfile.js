// Load plugins
const gulp = require('gulp');
const connect = require('gulp-connect');
const autoprefixer = require('gulp-autoprefixer');
const cleanCss = require('gulp-clean-css');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const open = require('open');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const header = require('gulp-header');
const pkg = require('./package.json');

const banner = `/*
 * jQuery Slot Machine v${pkg.version}
 * ${pkg.repository.url.replace(/\.git$/)}
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the ${pkg.license} license
 */
`;

// Lint javascript
gulp.task('lint', () => {
  return gulp.src([
    'lib/**/*.js',
    'tests/**/*.js'
  ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Styles
gulp.task('styles', () => {
  return gulp.src([
    'styles/index.css'
  ])
    .pipe(autoprefixer({
      browsers: ['last 10 versions', 'ie 8', 'ie 9'],
      cascade: false
    }))
    .pipe(rename({ basename: 'jquery.slotmachine' }))
    .pipe(header(banner))
    .pipe(gulp.dest('dist'))
    .pipe(cleanCss({
      compatibility: 'ie8'
    }))
    .pipe(header(banner))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

// Scripts
gulp.task('jquery-wrapper', () => {
  return browserify('./lib/jquery.js', {
    debug: true
  })
    .transform(babelify, {
      presets: ['env']
    })
    .bundle()
    .pipe(source('jquery.slotmachine.js'))
    .pipe(buffer())
    .pipe(header(banner))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify().on('error', console.error))
    .pipe(header(banner))
    .pipe(connect.reload())
    .pipe(gulp.dest('dist'));
});
gulp.task('scripts', ['lint', 'jquery-wrapper'], () => {
  return browserify({
    entries: './lib/index.js',
    extensions: ['.js'],
    exclude: ['jquery.js'],
    debug: true,
    paths: ['./lib/', './node_modules']
  })
    .transform(babelify, {
      presets: ['env']
    })
    .bundle()
    .pipe(source('slotmachine.js'))
    .pipe(buffer())
    .pipe(header(banner))
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify().on('error', console.error))
    .pipe(header(banner))
    .pipe(connect.reload())
    .pipe(gulp.dest('dist'));
});

// Clean
gulp.task('clean', () => {
  return gulp.src(['dist'], { read: false })
    .pipe(clean());
});

// Build App
gulp.task('build', ['clean'], (callback) => {
  runSequence(
    'styles',
    'scripts',
    callback
  );
});

// Default task
gulp.task('default', ['build']);

// Watch
gulp.task('server', ['build'], () => {
  // Watch .scss files
  gulp.watch('styles/**/*.css', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    gulp.run('styles');
  });

  // Watch .js files
  gulp.watch('lib/**/*.js', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    gulp.run('scripts');
  });

  connect.server({
    // root: 'docs',
    livereload: true
  });

  open('http://localhost:8080');
});
