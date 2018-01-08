var gulp = require('gulp'),
    fs = require('fs-extra'),
    glob = require('glob'),
    path = require('path'),
    _ = require('lodash'),
    browserSync = require('browser-sync').create(),
    jsonServer = require('json-server'),
    enableDestroy = require('server-destroy');
    proxy=require('http-proxy-middleware');

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: 'app',
            routes: {
                "/node_modules": "node_modules"
            }
        }
    });

    gulp.watch([
        '**/*.html',
        '**/*.js'
    ], {
        cwd: 'app'
    }).on('change', browserSync.reload);
});

gulp.task('serve:mock', function () {
    var instance = startJSONServer();

    gulp.watch([
        '*.json'
    ], {
        cwd: 'mock'
    }).on('change', function () {
        instance.destroy(function () {
            console.log('JSON Server is stopping');
        });

        instance = startJSONServer();
    });
});

function startJSONServer() {
    var db = {},
        dbFiles = glob.sync('mock/*.json');

    dbFiles.forEach(function (dbFile) {
        _.extend(db, fs.readJsonSync(path.resolve(dbFile)))
    });

    var server = jsonServer.create(),
        router = jsonServer.router(db),
        middlewares = jsonServer.defaults();

    server.use(middlewares);
    server.use(jsonServer.bodyParser);
    server.use(function (request, response, next) {
        var page = request.query.page,
            size = request.query.size || 10;
        if (page) {
            request.query._page = page;
            request.query._limit = size;

            router.render = function (request, response) {
                var pageInfo = parseLink(response.get('Link'), page, size, response.locals.data.length);
                console.log(pageInfo);

                if (response.locals.data.length > 0) {
                    response.jsonp(_.merge({
                        'content': response.locals.data
                    }, pageInfo));
                } else {
                    response.jsonp([]);
                }
            };
        } else {
            router.render = function (request, response) {
                response.jsonp(response.locals.data);
            };
        }

        if (request.query.sort) {
            if (Array.isArray(request.query.sort)) {
                var _sort = [],
                    _order = [];
                request.query.sort.forEach(function (sort) {
                    var sort_order = sort.split(',');
                    if (sort_order[1]) {
                        _order.push(sort_order[1]);
                    }

                    _sort.push(sort_order[0]);
                });

                request.query._sort = _sort.join(',');
                request.query._order = _order.join(',');
            } else {
                var sort_order = request.query.sort.split(',');
                if (sort_order[1]) {
                    request.query._order = sort_order[1];
                }

                request.query._sort = sort_order[0];
            }
        }

        next();
    });
   /* server.use(jsonServer.rewriter({
        '/user-center/users':'/users'
    }));*/
    server.use('/user-center',proxy({target:'http://32.1.2.61:8081/manager',changeOrigin:true}));
    server.use(router);

    var instance = server.listen(4000, function () {
        console.log('JSON Server is running');
    });
    enableDestroy(instance);



    return instance;
}

function parseLink(link, page, size, numberOfElements) {
    if (!link) {
        return {
            'totalPages': 1,
            'totalElements': numberOfElements,
            'last': true,
            'size': size,
            'number': page,
            'numberOfElements': numberOfElements,
            'first': true
        }
    }

    var links = link.split(','),
        rel = {};
    _.forEach(links, function (link) {
        var name_url = link.split('; ');
        rel[name_url[1].replace('rel="', '').replace('"', '')] = name_url[0].trim().replace('<', '').replace('>', '');
    });

    var url = require('url');
    var lastQuery = url.parse(rel['last'], true).query;

    return {
        'totalPages': lastQuery.page,
        'totalElements': lastQuery.size * lastQuery.page,
        'last': rel['next'] === undefined,
        'size': lastQuery.size,
        'number': page,
        'numberOfElements': numberOfElements,
        'first': rel['prev'] === undefined
    }
}
