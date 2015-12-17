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
		var orig = sheets.get($routeParams.id);
		sheets.edit(orig.id, $scope.data);
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
		var nextId = this.storage.getItem('nextId');
		if (nextId === null) {
			this.storage.setItem('nextId', 1);
		}
		var val = this.storage.getItem('applianceList');
		if (val === null) {
			this.list = [];
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'aaa-xxx-000',
				datePurchased: Date.now(),
				product: 'エアコン',
				maker: 'Panasonic',
				store: 'ヤマダ電気'
			});
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'bbb-x-YYY-000',
				datePurchased: Date.now(),
				product: 'テレビ',
				maker: '東芝',
				store: 'ヨドバシカメラ'
			});
			var id = this.insert();
			this.edit(id, {
				modelNumber: 'ccc-x-YYY-000',
				datePurchased: Date.now(),
				product: 'テレビ2',
				maker: '東芝',
				store: 'ヨドバシカメラ'
			});
		} else {
			this.list = JSON.parse(val);
		}
	};

	this.edit = function(id, data) {
		var index = this.list.length;

		while (index--) {
			var l = this.list[index];
			if (l.id == id) {
				this.list[index] = {
					id: id,
					createdAt: Date.now(),
					data: data
				};
				this.storage.setItem('applianceList', JSON.stringify(this.list));
			}
		}
		return null;
	};

	this.add = function(data) {
		this.list.push({
			id: String(this.list.length + 1),
			createdAt: Date.now(),
			data: data
		});
		this.storage.setItem('applianceList', JSON.stringify(this.list));
	};

	this.insert = function() {
		var nextId = this.storage.getItem('nextId');
		this.list.push({
			id: String(nextId),
			createdAt: undefined,
			data: undefined
		});
		this.storage.setItem('applianceList', JSON.stringify(this.list));
		this.storage.setItem('nextId', Number(nextId) + 1);

		return nextId;
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
		this.storage.removeItem('nextId');
	};

	this.initialize();
}]);
