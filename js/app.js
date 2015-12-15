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

	$scope.listReset = function() {
		sheets.listReset();
		$scope.list = sheets.list;
	};
}]);

app.controller('CreationController', ['$scope', '$location', 'sheets', function CreationController($scope, $location, sheets) {
	function createItem() {
		return {
			modelNumber: '',
			datePurchased: '',
			store: '',
		};
	}

	$scope.initialize = function () {
		$scope.data = [createItem()];
		$scope.ocr = new Ocr();
		$scope.ocr.setCallback(function(text) {
			ocrLines = text.split(/\n/);
			// remove null strings
			ocrLines.pop();
			ocrLines.pop();
			console.log(ocrLines);
			$scope.$apply(function() {
				$scope.data.modelNumber = ocrLines[Math.floor((ocrLines.length - 1)/2)];
			});
		});
	};

	$scope.save = function () {
		sheets.add($scope.data);
		$location.path('/');
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

	this.add = function(data) {
		this.list.push({
			id: String(this.list.length + 1),
			createdAt: Date.now(),
			data: data
		});
		this.storage.setItem('applianceList', JSON.stringify(this.list));
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

	this.listReset = function() {
		this.list = [];
		this.storage.removeItem('applianceList');
	};

	this.initialize();
}]);
