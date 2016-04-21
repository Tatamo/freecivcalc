var gulp = require("gulp");
var fs = require("fs");
var plumber = require("gulp-plumber");
var rename = require("gulp-rename");
var ejs = require("gulp-ejs");

gulp.task("ejs", function(){
	var json = JSON.parse(fs.readFileSync("./template/index.json"));
	gulp.src("./template/index.ejs")
	.pipe(plumber())
	.pipe(ejs(json))
	.pipe(rename("index.html"))
	.pipe(gulp.dest('./'));

	var json_en = JSON.parse(fs.readFileSync("./template/index_en.json"));
	gulp.src("./template/index.ejs")
	.pipe(plumber())
	.pipe(ejs(json_en))
	.pipe(rename("index_en.html"))
	.pipe(gulp.dest('./'));
});
