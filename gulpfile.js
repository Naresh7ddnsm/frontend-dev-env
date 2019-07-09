// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, task, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
var replace = require('gulp-replace');

// Declaring Paths 
const fsPath = { 
	basePath: './app/',
	baseDestPath: './dist/',
	htmlPath: './*.html',
	htmlDestPath: './dist/',
    scssPath: './app/scss/**/*.scss',
	scssDestPath: './dist/assets/css/',
    jsPath: 'app/js/**/*.js',
	jsDestPath: './dist/assets/js/',
	imagesPath: './app/images/',
	imagesDestPath: './dist/assetes/images/'
}

// Moving HTML files
task('htmlTask', () => { 
	return src(fsPath.htmlPath)
	.pipe(dest(fsPath.htmlDestPath));
})

// Sass task: compiles the style.scss file into style.css
task('scssTask', () => {    
    return src(fsPath.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest(fsPath.scssDestPath)
    ); // put final CSS in dist folder
})

// JS task: concatenates and uglifies JS files to script.js
task('jsTask', () => {
    return src([
        fsPath.jsPath
	])
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(dest(fsPath.jsDestPath)
	);
});

// Reload browser
// done: callback function to make sure the reload function is completed.
task('browserSyncReload', (done) => {
  browserSync.reload();
  done();
})

// Browser sync
task('browsersync', ()=> {
  browserSync.init({
    server: {
      baseDir: fsPath.baseDestPath
    },
    port: 3000
  });
})
// Watcher 
// watch([filePath], series('Task', 'Reload Task'))
// filePath: Actual file which will be changed on development phase
// Task, Reload Task: Callback tasks, which run in series if the file changes occurs in mentioned path.
task('watcher', () => {
	watch([fsPath.htmlPath], series('htmlTask', 'browserSyncReload'))
	watch([fsPath.scssPath], series('scssTask', 'browserSyncReload'))
	watch([fsPath.jsPath], series('jsTask', 'browserSyncReload'))
})

// Task will be execute on gulp command 
exports.default = series(
	series('htmlTask', 'scssTask', 'jsTask'),
	parallel('browsersync', 'watcher')
);


