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

app.controller('SheetListController', [function SheetListController() {
	
}]);

app.controller('CreationController', ['$scope', function CreationController($scope) {
	function createOrderLine() {
		return {
			productName: '',
			unitPrice: 0,
			count: 0
		};
	}

	$scope.lines = [createOrderLine()];

	$scope.initialize = function () {
		$scope.lines = [createOrderLine()];
	};

	$scope.addLine = function () {
		$scope.lines.push(createOrderLine());
	};

	$scope.save = function () {
	};

	$scope.removeLine = function (target) {
		var lines = $scope.lines;
		var index = lines.indexOf(target);

		if (index !==  -1) {
			lines.splice(index, 1);
		}
	};

	$scope.getSubtotal = function (orderLine) {
		return orderLine.unitPrice * orderLine.count;
	};

	$scope.getTotalAmount = function (lines) {
		var totalAmount = 0;

		angular.forEach(lines, function (orderLine) {
			totalAmount += $scope.getSubtotal(orderLine);
		});

		return totalAmount;
	};
}]);

app.controller('SheetController', [function SheetController() {
}]);
