'use strict';

var cdApp = angular.module('cdApp');

cdApp.config(['growlProvider',
	function (growlProvider){
		growlProvider.globalTimeToLive(5000);
	}]);

cdApp.config(function (uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
});