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
		.when('/edit/:id', {
			templateUrl: 'new-tmpl',
			controller: 'CreationController'
		})
		.otherwise({
			redirectTo: '/'
		});	
}]);

app.controller('SheetListController', ['$scope', '$location', 'sheets', function SheetListController($scope, $location, sheets) {
	$scope.list = sheets.list;

	$scope.register = function() {
		var id = sheets.insert();
		$location.path('/edit/' + id);
	};

	$scope.listReset = function() {
		sheets.listReset();
		$scope.list = sheets.list;
	};
}]);

app.controller('CreationController', ['$scope', '$routeParams', '$location', 'sheets', function CreationController($scope, $routeParams, $location, sheets) {
	function createItem() {
		return {
			modelNumber: '',
			datePurchased: '',
			product: '',
			maker: '',
			store: '',
		};
	}

	$scope.initialize = function () {
		angular.extend($scope, sheets.get($routeParams.id));
		$scope.adding = ($scope.createdAt === undefined? true: false);
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
		sheets.edit($routeParams.id, {
			modelNumber: $scope.data.modelNumber,
			datePurchased: new Date($scope.data.datePurchased),
			product: $scope.data.product,
			maker: $scope.data.maker,
			store: $scope.data.store
		});
		$location.path('/');
	};

	$scope.loadFile = function(fileElem) {
		var file = fileElem.files[0];
		$scope.ocr.loadFile(file);
	};

	$scope.cancel = function() {
		if ($scope.adding === true) {
			sheets.removeById($scope.id);
			$location.path('/');
		} else {
			$location.path('/sheet/' + $scope.id);
		}
	};

	$scope.initialize();
}]);

app.controller('SheetController', ['$scope', '$routeParams', '$location', 'sheets', function SheetController($scope, $routeParams, $location, sheets) {
	angular.extend($scope, sheets.get($routeParams.id));

	$scope.id = $routeParams.id;

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
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'aaa-xxx-000',
				datePurchased: new Date(),
				product: 'エアコン',
				maker: 'Panasonic',
				store: 'ヤマダ電気'
			});
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'bbb-x-YYY-000',
				datePurchased: new Date(),
				product: 'テレビ',
				maker: '東芝',
				store: 'ヨドバシカメラ'
			});
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'ccc-x-YYY-000',
				datePurchased: new Date(),
				product: 'テレビ2',
				maker: '東芝',
				store: 'ヨドバシカメラ'
			});
		} else {
			this.list = angular.fromJson(val);
			// convert to date object
			angular.forEach(this.list, function(v) {
				v.data.datePurchased = new Date(v.data.datePurchased);
			});
		}
	};

	this.edit = function(id, data) {
		if (this.list[id] === undefined) {
			return null;
		}
		this.list[id] = {
			createdAt: Date.now(),
			data: data
		};
		this.storage.setItem('applianceList', angular.toJson(this.list));
	};

	this.insert = function() {
		this.list.push({
			createdAt: undefined,
			data: undefined
		});
		return this.list.length - 1;
	};

	this.removeById = function(id) {
		this.list.splice(id, 1);
		this.storage.setItem('applianceList', angular.toJson(this.list));
	};

	this.get = function (id) {
		return this.list[id];
	};

	this.listReset = function() {
		this.list = [];
		this.storage.removeItem('applianceList');
	};

	this.initialize();
}]);
