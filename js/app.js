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

app.controller('CreationController', ['$scope', '$location', 'sheets', 'counting', function CreationController($scope, $location, sheets, counting) {
//app.controller('CreationController', ['$scope', '$location', 'sheets', function CreationController($scope, $location, sheets) {
	function createOrderLine() {
		return {
			modelNumber: '',
			datePurchased: '',
			productName: '',
			unitPrice: 0,
			count: 0
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

/*
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
*/

	angular.extend($scope, counting);

	$scope.initialize();
	
}]);

app.controller('SheetController', ['$scope', '$routeParams', 'sheets', 'counting', function SheetController($scope, $routeParams, sheets, counting) {
//	var sheet = sheets.get($routeParams.id);

	angular.extend($scope, sheets.get($routeParams.id));
	angular.extend($scope, counting);

}]);

app.service('sheets', [function () {
	this.list = []; // 帳票リスト

	// 明細行リストを受け取り新しい帳票を作成して帳票リストに加える
	this.add = function (list) {
		angular.forEach(list, function (l) {
			this.list.push({
				id: String(this.list.length + 1),
				createdAt: Date.now(),
				data: l
			});
		}.bind(this));
	};

	// 任意の id を持った帳票を返す
	this.get = function (id) {
		var index = this.list.length;

		while (index--) {
			var l = this.list[index];
			if (l.id === id) {
				console.log('id!');
				return l;
			}
		}
		console.log('id not ..');
		return null;
	};
}]);

app.service('counting', function() {
	this.getSubtotal = function(data) {
//		return data.unitPrice * data.count;		
	};

	this.getTotalAmount = function(lines) {
		var totalAmount = 0;

		angular.forEach(lines, function (data) {
			totalAmount += this.getSubtotal(data);
		}, this);

		return totalAmount;
	};
});
