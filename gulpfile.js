'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var plumber = require('gulp-plumber');

var HTML_SRC_DIR = 'src/server/views/';
var LESS_SRC_DIR = 'src/client/styles/';
var LESS_DEST = 'public/css/';

gulp.task('default', ['stylesheets']);

gulp.task('stylesheets', function() {
	return gulp.src(LESS_SRC_DIR + 'index.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(gulp.dest(LESS_DEST))
		.pipe(livereload());
});

gulp.task('watch', ['default'], function() {
	livereload.listen();

	gulp.watch(LESS_SRC_DIR + '**/*.less', ['stylesheets']);
	gulp.watch(HTML_SRC_DIR + '**/*.html', function() {
		livereload.reload();
	});
});

