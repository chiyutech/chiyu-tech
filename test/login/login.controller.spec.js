describe('LoginController', function () {
    var loginController,
        returnToState,
        authService,
        $state;

    beforeEach(function () {
        module('app.login');

        inject(function ($injector, $controller, $q) {
            returnToState = jasmine.createSpyObj('returnToState', ['state', 'params', 'options']);

            authService = jasmine.createSpyObj('authService', ['authenticate']);
            authService.authenticate.and.callFake(function () {
                var deferred = $q.defer();
                deferred.resolve('authenticate result');
                return deferred.promise;
            });

            $state = jasmine.createSpyObj('$state', ['go']);

            loginController = $controller('LoginController', {
                returnToState: returnToState,
                authService: authService,
                $state: $state
            })
        });
    });

    it('has a default credential', function () {
        expect(loginController.credential).toEqual({
            username: 'admin',
            password: 'admin'
        })
    });

    it('can login', function () {
        expect(loginController.login).toBeFunction();

        loginController.login({
            username: 'admin',
            password: 'admin'
        });

        expect(authService.authenticate).toHaveBeenCalledTimes(1);
        expect(returnToState.state).toHaveBeenCalledTimes(1);
        expect(returnToState.params).toHaveBeenCalledTimes(1);
        expect(returnToState.options).toHaveBeenCalledTimes(1);
        expect($state.go).toHaveBeenCalledTimes(1);
    });
});
