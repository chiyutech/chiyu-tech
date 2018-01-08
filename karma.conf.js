// Karma configuration
// Generated on Fri Oct 20 2017 10:50:45 GMT+0800 (China Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'jasmine-matchers'],


        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/popper.js/dist/umd/popper.js',
            'node_modules/bootstrap/dist/js/bootstrap.js',

            'node_modules/angular/angular.js',
            'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
            'node_modules/oclazyload/dist/ocLazyLoad.js',
            'node_modules/angular-mocks/angular-mocks.js',

            'node_modules/angular-animate/angular-animate.js',
            'node_modules/angular-sanitize/angular-sanitize.js',
            'node_modules/angular-breadcrumb/dist/angular-breadcrumb.js',
            'node_modules/angular-loading-bar/build/loading-bar.js',
            'node_modules/angular-local-storage/dist/angular-local-storage.js',

            'node_modules/lodash/lodash.js',
            'node_modules/restangular/dist/restangular.js',

            'app/blocks/auth/auth.module.js',
            'app/blocks/auth/auth.service.js',
            'app/app.module.js',
            'app/app.route.js',
            'app/app.config.js',
            'app/layout/header.controller.js',
            'app/layout/sidebar.controller.js',
            'app/core/core.module.js',
            'app/login/login.module.js',
            'app/login/login.route.js',
            'app/login/login.controller.js',

            'test/**/*.spec.js'
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec', 'kjhtml'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
};
