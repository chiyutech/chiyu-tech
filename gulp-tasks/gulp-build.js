var _ = require('lodash'),
    appName = require('../package.json').name,
    browserSync = require('browser-sync').create(),
    del = require('del'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    mainNpmFiles = require('npmfiles');

var vendorFonts = [
    'node_modules/font-awesome/fonts/**',
    'node_modules/simple-line-icons/fonts/**'
];

var preloadAppJs = [
    './app/blocks/auth/auth.module.js',
    './app/blocks/auth/auth.service.js',

    './app/app.module.js',
    './app/app.config.js',
    './app/app.route.js',
    './app/layout/header.controller.js',
    './app/layout/sidebar.controller.js',

    './app/core/core.module.js',
    './app/core/core.directive.js'
];

var lazyloadAppJs = [
    './app/login/*.js',
    './app/dashboard/*.js',
    './app/foo/*.js',
    './app/bar/*.js',
    './app/pages/*.js'
];

gulp.task('release:dryrun', function (done) {
    runSequence('copy:npm-main-files',
        'scss',
        [
            'concat:preload-vendor-js',
            'concat:preload-vendor-css',
            'copy:vendor-fonts',

            'concat-minify:preload-app-js',
            'concat-minify:preload-app-css',
            'minify:lazyload-app-js',
            'minify:app-html',
            'copy:app-image'
        ],
        'gen:release-index',
        done
    );
});

gulp.task('release', ['release:dryrun'], function () {
    return gulp.src('./dist/app/*')
        .pipe(plugins.zip(appName + '.zip'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('serve:release', function () {
    browserSync.init({
        server: {
            baseDir: 'dist/app'
        }
    });

    gulp.watch([
        '**/*.html',
        '**/*.js'
    ], {
        cwd: 'dist/app'
    }).on('change', browserSync.reload);
});

gulp.task('clean:release', function () {
    return del('./dist');
});

////////////////

gulp.task('scss', function () {
    return gulp.src('./scss/style.scss')
        .pipe(plugins.sass())
        .pipe(gulp.dest("./app"))
        .pipe(browserSync.stream());
});

gulp.task('copy:npm-main-files', function () {
    return gulp.src(mainNpmFiles({nodeModulesPath: '../node_modules'}))
        .pipe(gulp.dest('./dist/app/vendor'));
});

gulp.task('concat:preload-vendor-js', function (done) {
    var preloadVendorJs = _.filter(getPreloadMainFiles(), function (mainFile) {
        return mainFile.endsWith('.js');
    });

    gulp.src(preloadVendorJs)
        .pipe(plugins.concat('vendor.bundle.js'))
        .pipe(plugins.rename({extname: '.min.js'}))
        .pipe(gulp.dest('./dist/app/vendor'))
        .on('end', function () {
            del(preloadVendorJs).then(function () {
                done();
            });
        });
});

gulp.task('concat:preload-vendor-css', function (done) {
    var preloadVendorCss = _.filter(getPreloadMainFiles(), function (mainFile) {
        return mainFile.endsWith('.css');
    });

    gulp.src(preloadVendorCss)
        .pipe(plugins.concat('vendor.bundle.min.css'))
        .pipe(gulp.dest('./dist/app/vendor/css'))
        .on('end', function () {
            del(preloadVendorCss).then(function () {
                done();
            });
        });
});

gulp.task('concat-minify:preload-app-js', function () {
    return gulp.src(preloadAppJs)
        .pipe(plugins.concat('app.bundle.js'))
        .pipe(plugins.replace(/node_modules(.*)\/(.*).js/ig, 'vendor/$2.min.js'))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({extname: '.min.js'}))
        .pipe(gulp.dest('./dist/app'));
});

gulp.task('copy:vendor-fonts', function () {
    return gulp.src(vendorFonts)
        .pipe(gulp.dest('./dist/app/vendor/fonts'));
});

gulp.task('concat-minify:preload-app-css', function () {
    var appPreLoadCssFiles = [
        './app/**/*.css'
    ];

    return gulp.src(appPreLoadCssFiles)
        .pipe(plugins.concat('app.bundle.css'))
        .pipe(plugins.cleanCss())
        .pipe(plugins.rename({extname: '.min.css'}))
        .pipe(gulp.dest('./dist/app'));
});

gulp.task('minify:lazyload-app-js', function () {
    return gulp.src(lazyloadAppJs, {base: '.'})
        .pipe(plugins.uglify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('minify:app-html', function () {
    var htmlFiles = [
        './app/**/*.html',
        '!./app/index.html'
    ];

    return gulp.src(htmlFiles, {base: '.'})
        .pipe(plugins.htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy:app-image', function () {
    var images = [
        './app/**/*.png',
        './app/**/*.jpg'
    ];

    return gulp.src(images, {base: '.'})
        .pipe(gulp.dest('./dist'));
});

gulp.task('gen:release-index', function () {
    var vendorBundleJs = gulp.src(['./dist/app/vendor/vendor.bundle.min.js'], {read: false}),
        vendorBundleCss = gulp.src(['./dist/app/vendor/css/vendor.bundle.min.css'], {read: false}),
        appBundleCss = gulp.src(['./dist/app/app.bundle.min.css'], {read: false}),
        appBundleJs = gulp.src(['./dist/app/app.bundle.min.js'], {read: false});

    return gulp.src('./app/index.html')
        .pipe(gulp.dest('./dist/app'))
        .pipe(plugins.inject(vendorBundleJs, {
            starttag: '<!-- inject:vendor:{{ext}} -->',
            relative: true
        }))
        .pipe(plugins.inject(vendorBundleCss, {
            starttag: '<!-- inject:vendor:{{ext}} -->',
            relative: true
        }))
        .pipe(plugins.inject(appBundleJs, {
            starttag: '<!-- inject:app:{{ext}} -->',
            relative: true
        }))
        .pipe(plugins.inject(appBundleCss, {
            starttag: '<!-- inject:app:{{ext}} -->',
            relative: true
        }))
        .pipe(gulp.dest('./dist/app'));
});

function getPreloadMainFiles() {
    var npmMainFileConfig = require('../package.json').overrides,
        mainFiles = [];

    _.forOwn(npmMainFileConfig, function (value, key) {
        if (value.preload) {
            mainFiles = _.concat(mainFiles, value.main);
        }
    });

    _.forEach(mainFiles, function (mainFile) {
        mainFiles.push('./dist/app/vendor/' + mainFile.split('/').pop());
    });

    return mainFiles;
}
