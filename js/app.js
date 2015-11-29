var app = angular.module('App', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'index-tmpl',
			controller: 'SheetListController'
		})
		.when('/new', {
			templateUrl: 'new-tmpl',
			controller: 'CreationController'
		})
		.when('/sheet/:id', {
			templateUrl: 'sheet-tmpl',
			controller: 'SheetController'
		})
		.otherwise({
			redirectTo: '/'
		});	
}]);

app.controller('SheetListController', ['$scope', 'sheets', function SheetListController($scope, sheets) {
	$scope.list = sheets.list;
}]);

app.controller('CreationController', ['$scope', '$location', 'sheets', function CreationController($scope, $location, sheets) {
	function createOrderLine() {
		return {
			modelNumber: '',
			datePurchased: '',
		};
	}

	$scope.initialize = function () {
		$scope.lines = [createOrderLine()];
	};

	$scope.addLine = function () {
		$scope.lines.push(createOrderLine());
	};

	$scope.save = function () {
		sheets.add($scope.lines);
		$location.path('/');
	};

	$scope.removeLine = function (target) {
		var lines = $scope.lines;
		var index = lines.indexOf(target);

		if (index !==  -1) {
			lines.splice(index, 1);
		}
	};

	$scope.initialize();
	
}]);

app.controller('SheetController', ['$scope', '$routeParams', 'sheets', function SheetController($scope, $routeParams, sheets) {
	angular.extend($scope, sheets.get($routeParams.id));
}]);

app.service('sheets', [function () {
	this.list = [];

	this.add = function (list) {
		angular.forEach(list, function (l) {
			this.list.push({
				id: String(this.list.length + 1),
				createdAt: Date.now(),
				data: l
			});
		}.bind(this));
	};

	this.get = function (id) {
		var index = this.list.length;

		while (index--) {
			var l = this.list[index];
			if (l.id === id) {
				return l;
			}
		}
		return null;
	};
}]);
