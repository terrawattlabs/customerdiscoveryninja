
cdApp.controller('TestpageCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$modal', '$log',
   	function ($scope, $timeout, $routeParams, growl, $modal, $log) {
   		var currentUser = Parse.User.current();
   	

    $scope.getPhoneNumbers = function () {
    	console.log('got to the function');
    	var areaCodeInput = $scope.areaCode;

    	Parse.Cloud.run('getAvailNumbers', {
      		 "areaCode": areaCodeInput
    		}, {
    			success: function(result) {
					$scope.availNumbers = result;
					$scope.$apply();
    		},
			    error: function(error) {
			     
			    }
  			});

    };
    
    $scope.purchaseNumber = function (phone) {
    	var phoneNumber = phone;
    	var email = currentUser.get('email');
    	var userID = currentUser.id;
    	console.log(phoneNumber + " " + email + " " + " " + userID)

    	Parse.Cloud.run('purchaseNumber', {
      		 "email": email,
      		 "userID": userID,
      		 "phone": phoneNumber
    		}, {
    			success: function(result) {
    				console.log('you bought the number');
    				console.log(result);
    		},
			    error: function(error) {
			     
			    }
  			});

    };	

   	}]);