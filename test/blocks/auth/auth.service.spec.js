describe('block.auth - authService', function () {
    var authService,
        Restangular,
        localStorageService,
        $httpBackend,
        username = 'zjh';

    beforeEach(function () {
        module('block.auth');

        inject(function ($injector) {
            authService = $injector.get('authService');
            Restangular = $injector.get('Restangular');
            localStorageService = $injector.get('localStorageService');
            localStorageService.set('username', username);

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', Restangular.configuration.baseUrl + '/acl/' + username)
                .respond(200, {
                    "id": "zjh",
                    "states": [
                        "app.foo"
                    ]
                });
        });
    });

    it('can check current access is authenticated or not', function () {
        expect(authService.isAuthenticated).toBeFunction();
        expect(authService.isAuthenticated()).toBeTruthy();
    });

    it('can get current authentication', function () {
        expect(authService.getAuthentication).toBeFunction();
        expect(authService.getAuthentication()).toEqual(username);
    });

    it('can check has permission to access state', function () {
        var expectResult;
        expect(authService.decideAccess).toBeFunction();
        authService.decideAccess('app.foo', username)
            .then(function (result) {
                expectResult = result;
            });

        $httpBackend.flush();

        expect(expectResult).toBeTruthy();
    });

    it('can authenticate', function () {
        expect(authService.authenticate).toBeFunction();
        authService.authenticate('admin', 'admin')
            .then(function (username) {
                expect(username).toEqual('admin');
            });
    });
});
