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
		$scope.ocr = new Ocr();
		$scope.ocr.setCallback(function(text) {
			ocrLines = text.split(/\n/);
			// remove null strings
			ocrLines.pop();
			ocrLines.pop();
			console.log(ocrLines);
			$scope.$apply(function() {
				$scope.lines[$scope.lines.length - 1].modelNumber = ocrLines[Math.floor((ocrLines.length - 1)/2)];
			});
		});
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

	$scope.loadFile = function(fileElem) {
		var file = fileElem.files[0];
		$scope.ocr.loadFile(file);
	};

	$scope.initialize();
}]);

app.controller('SheetController', ['$scope', '$routeParams', '$location', 'sheets', function SheetController($scope, $routeParams, $location, sheets) {
	angular.extend($scope, sheets.get($routeParams.id));

	$scope.remove = function(id) {
		sheets.removeById(id);
		$location.path('/');
	};
}]);

app.service('sheets', ['$filter', function ($filter) {
	var where = $filter('filter');

	this.initialize = function() {
		this.storage = localStorage;
		var val = this.storage.getItem('applianceList');
		if (val === null) {
			this.list = [];
		} else {
			this.list = JSON.parse(val);
		}
	};

	this.add = function(list) {
		angular.forEach(list, function (l) {
			this.list.push({
				id: String(this.list.length + 1),
				createdAt: Date.now(),
				data: l
			});
			this.storage.setItem('applianceList', JSON.stringify(this.list));
		}.bind(this));
	};

	this.removeById = function(id) {
		this.list = where(this.list, function(l) {
			return l.id !== id;
		});
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

	this.initialize();
}]);
