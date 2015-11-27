app = angular.module('App', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'index-tmpl'
		})
		.when('/new', {
			templateUrl: 'new-tmpl'
		})
		.when('/sheet/:id', {
			templateUrl: 'sheet-tmpl'
		})
		.otherwise({
			redirectTo: '/'
		});	
}]);
