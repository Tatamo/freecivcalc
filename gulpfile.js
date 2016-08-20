var gulp = require("gulp");
var fs = require("fs");
var rimraf = require("rimraf");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var ejs = require("gulp-ejs");
var typescript = require("gulp-typescript");
var runSequence = require("run-sequence");
var merge = require("event-stream").merge;

var DIST_DIR = "./dist";

gulp.task("ejs", function(){
	var json = JSON.parse(fs.readFileSync("./src/template/index_ja.json"));
	var json_en = JSON.parse(fs.readFileSync("./src/template/index_en.json"));
	return merge(
		gulp.src("./src/template/index.ejs")
		.pipe(plumber())
		.pipe(ejs(json))
		.pipe(rename("index.html"))
		.pipe(gulp.dest(DIST_DIR)),

		gulp.src("./src/template/index.ejs")
		.pipe(plumber())
		.pipe(ejs(json_en))
		.pipe(rename("index_en.html"))
		.pipe(gulp.dest(DIST_DIR))
	);
});

gulp.task("cp_static", function(){
	return gulp.src(["./static/**"], {base:"./static"})
		.pipe(gulp.dest(DIST_DIR));
});

gulp.task("cp_widget_js", function(){
	return gulp.src(["./widgets.js"], {base:"./"})
		.pipe(gulp.dest(DIST_DIR));
});

gulp.task("ts", function(){
	return gulp.src("./src/*.ts")
		.pipe(typescript({
			target: "ES5",
			outFile: "freecivcalc.js"
		}))
		.pipe(gulp.dest(DIST_DIR));
});

gulp.task("clean", function(cb){
	rimraf(DIST_DIR, cb);
});

gulp.task("build", function(cb){
	runSequence("clean", ["ts", "ejs", "cp_static", "cp_widget_js"], cb);
});

