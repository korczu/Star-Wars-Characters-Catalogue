var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('styles',function(){
	return gulp.src('style.css')
	.pipe(autoprefixer('last 2 version'))
	.pipe(gulp.dest('build'))

});
	gulp.task('watch', function(){
    gulp.watch('style.css'/* ścieżka do pliku*/, gulp.series(['styles'/*nazwa taska */]))
});