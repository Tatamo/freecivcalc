var gulp = require("gulp");
var fs = require("fs");
var rimraf = require("rimraf");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var ejs = require("gulp-ejs");
var typescript = require("gulp-typescript");
var runSequence = require("run-sequence");
var merge = require("event-stream").merge;

gulp.task("ejs", function(){
	var json = JSON.parse(fs.readFileSync("./src/template/index_ja.json"));
	var json_en = JSON.parse(fs.readFileSync("./src/template/index_en.json"));
	return merge(
		gulp.src("./src/template/index.ejs")
		.pipe(plumber())
		.pipe(ejs(json))
		.pipe(rename("index.html"))
		.pipe(gulp.dest('./')),

		gulp.src("./src/template/index.ejs")
		.pipe(plumber())
		.pipe(ejs(json_en))
		.pipe(rename("index_en.html"))
		.pipe(gulp.dest('./'))
	);
});

gulp.task("dist", function(){
	return gulp.src(["./lib/**", "./css/**", "./data/**", "widgets.js", "freecivcalc.js", "./*.html"], {base:"./"})
		.pipe(gulp.dest("./dist"));
});

gulp.task("ts", function(){
	return gulp.src("./src/*.ts")
		.pipe(typescript({
			target: "ES5",
			outFile: "freecivcalc.js"
		}))
		.pipe(gulp.dest("./"));
});

gulp.task("clean", function(cb){
	rimraf("./dist", cb);
});

gulp.task("build", function(cb){
	runSequence("clean", ["ts", "ejs"], "dist", cb);
});

