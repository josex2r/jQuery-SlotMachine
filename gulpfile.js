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

// Lint javascript
gulp.task('lint', () => {
  return gulp.src([
    'src/**/*.js'
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
    .pipe(gulp.dest('dist'))
    .pipe(cleanCss({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

// Scripts
gulp.task('scripts', ['lint'], () => {
  return browserify({
    entries: './lib/index.js',
    extensions: ['.js'],
    debug: true,
    paths: ['./src/', './node_modules']
  })
    .transform(babelify, {
      presets: ['env']
    })
    .bundle()
    .pipe(source('jquery.slotmachine.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
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
  gulp.watch('src/styles/**/*.scss', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    gulp.run('styles');
  });

  // Watch .js files
  gulp.watch('src/**/*.js', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    gulp.run('scripts');
  });

  // Watch .js files
  gulp.watch('docs/**/*', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
    connect.reload()
  });

  connect.server({
    // root: 'docs',
    livereload: true
  });

  open('http://localhost:8080');
});
