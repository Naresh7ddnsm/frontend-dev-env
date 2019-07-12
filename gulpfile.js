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
const pug = require('gulp-pug');
const imagemin = require('gulp-imagemin');
var replace = require('gulp-replace');

// Declaring Paths 
const fsPath = { 
	app: {
		base: './app/' ,
		html: './app/*.html',
		pug: './app/**/*.pug',
		js: './app/js/**/*.js',
		css: './app/scss/*.scss',
		fonts: './app/fonts/*.*',
		img: './app/images/**/*',
		data: 'app/js/data/*.*',
	},
	dist: {
		base: './dist/',
		html: './dist/',
		js: './dist/assets/js/',
		css: './dist/assets/css/',
		fonts: './dist/assets/fonts/',
		img: './dist/assets/images/',
		data: './dist/assets/js/data/',
	}
}

//PUG: Using html template 
task('pugTask', () => {
	return src(fsPath.app.pug)
	.pipe(pug({
		pretty: true // Disable minifying the HTML
	})) // Compile PUG to HTML
	.pipe(dest(fsPath.dist.html)) // Put final HTML in dist folder
})

// Moving HTML files
task('htmlTask', () => { 
	return src(fsPath.app.html)
	.pipe(dest(fsPath.dist.html));
})

// Sass task: compiles the style.scss file into style.css
task('scssTask', () => {    
    return src(fsPath.app.css)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest(fsPath.dist.css)
    ); // put final CSS in dist folder
})

// JS task: concatenates and uglifies JS files to script.js
task('jsTask', () => {
    return src([
        fsPath.app.js
	])
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(dest(fsPath.dist.js)
	);
});


// Fonts
// Moveing fonts from app folder to dist folder
task('fontTask', function() {
    return src([fsPath.app.fonts])
		.pipe(dest(fsPath.dist.fonts));
});

// Images
// compress images
task('imageTask', function() {
    return src([fsPath.app.img])
		.pipe(imagemin({
			optimizationLevel: 5
		}))
		.pipe(dest(fsPath.dist.img));
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
      baseDir: fsPath.dist.base
    },
    port: 3000
  });
})
// Watcher 
// watch([filePath], series('Task', 'Reload Task'))
// filePath: Actual file which will be changed on development phase
// Task, Reload Task: Callback tasks, which run in series if the file changes occurs in mentioned path.
task('watcher', () => {
	watch([fsPath.app.pug], series('pugTask', 'browserSyncReload'))
	watch([fsPath.app.html], series('htmlTask', 'browserSyncReload'))
	watch([fsPath.app.css], series('scssTask', 'browserSyncReload'))
	watch([fsPath.app.js], series('jsTask', 'browserSyncReload'))
	watch([fsPath.app.fonts], series('fontTask', 'browserSyncReload'))
	watch([fsPath.app.img], series('imageTask', 'browserSyncReload'))
})

// Task will be execute on gulp command 
exports.default = series(
	// we can add more task as series
	series('htmlTask', 'pugTask', 'scssTask', 'jsTask', 'fontTask', 'imageTask'),
	parallel('browsersync', 'watcher')
);


