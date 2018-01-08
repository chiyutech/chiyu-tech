var gulp = require('gulp'),
    karmaServer = require('karma').Server;

gulp.task('test', function (done) {
    new karmaServer({
        configFile: __dirname + '/../karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('tdd', function (done) {
    new karmaServer({
        configFile: __dirname + '/../karma.conf.js'
    }, done).start();
});
