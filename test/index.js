angular.module('app', ['vd.directive.accordion'])
	.controller('example1', function($scope) {
		$scope.test = '42';
	})
	.controller('example2', function($scope) {
		$scope.test = '42';
		$scope.contacts = [{ name: 'Vince' }, { name: 'Pierre' }];
	});