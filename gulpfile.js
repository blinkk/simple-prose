const autoprefixer = require('gulp-autoprefixer');
const colors = require('colors/safe');
const esbuild = require('esbuild');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
sass.compiler = require('sass');

const ENTRIES = {
  js: {
    src: ['./src/ts/example/example.ts'],
    out: './dist/example.min.js',
    watch: ['./src/ts/**/*.ts'],
  },
  sass: {
    src: ['./src/sass/example.sass'],
    out: './dist/example.min.css',
    watch: ['./src/sass/**/*.sass'],
  },
};

function logStats(outfiles) {
  if (!Array.isArray(outfiles)) {
    outfiles = [outfiles];
  }
  outfiles.forEach(outfile => {
    const indent = ' '.repeat(4);
    const paddedSize = fileSize(outfile).padStart(8, ' ');
    const file = path.normalize(outfile);
    console.log(
      `${indent}${colors.white(paddedSize)}  ${colors.bold.white(file)}`
    );
  });
}

function fileSize(filepath) {
  const stats = fs.statSync(filepath);
  const bytes = stats.size;

  const k = 1024;
  const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + units[i];
}

gulp.task('build:js:dev', async () => {
  await esbuild.build({
    entryPoints: ENTRIES.js.src,
    bundle: true,
    outfile: ENTRIES.js.out,
    platform: 'browser',
    format: 'esm',
  });
  logStats(ENTRIES.js.out);
});

gulp.task('build:js:prod', async () => {
  await esbuild.build({
    entryPoints: ENTRIES.js.src,
    bundle: true,
    outfile: ENTRIES.js.out,
    platform: 'browser',
    format: 'esm',
    minify: true,
  });
  logStats(ENTRIES.js.out);
});

gulp.task('watch:js', () => {
  return gulp.watch(
    ENTRIES.js.watch,
    {ignoreInitial: false},
    gulp.series('build:js:dev')
  );
});

gulp.task('build:sass', () => {
  return gulp
    .src(ENTRIES.sass.src)
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: ['./node_modules/'],
      })
    )
    .on('error', sass.logError)
    .pipe(
      rename(filepath => {
        filepath.basename = path.basename(ENTRIES.sass.out).slice(0, -4);
      })
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.dirname(ENTRIES.sass.out)));
});

gulp.task('watch:sass', () => {
  return gulp.watch(
    ENTRIES.sass.watch,
    {ignoreInitial: false},
    gulp.series('build:sass')
  );
});

gulp.task('watch', gulp.parallel('watch:sass', 'watch:js'));
gulp.task('build', gulp.parallel('build:sass', 'build:js:prod'));
gulp.task('default', gulp.series('watch'));
