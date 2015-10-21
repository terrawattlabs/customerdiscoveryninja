cdApp.controller('NavCtrl',
   ['$scope', '$location', '$window', '$interval', '$route',
    function ($scope, $location, $window, $interval, $route) {
   		 var currentUser = Parse.User.current();
   		 $scope.currentUser = currentUser;
		 
		  $scope.logOut = function () {
	    	Parse.User.logOut();
	    	console.log('logged out');
		
			 $location.path('/');
			 $route.reload();

			//$window.location.reload();
    	};

    	function LogItOut (){
    		$scope.$apply( function() {
			    	$location.path('/');
			     	});
    		$route.reload();
    	};

    	$scope.isActive = function (viewLocation) { 
        	return viewLocation === $location.path();
    	};

    	$scope.isLoggedIn = function (){
    		var loggedIn = false;
    		if (currentUser) {
    			loggedIn = true;
    		};

    		return loggedIn;
    	};

    	var Message = Parse.Object.extend("Message");
		var query = new Parse.Query(Message);
		query.find({
		  success: function(results) {
		    for (var i = results.length - 1; i >= 0; i--) {
		    	var secString = results[i].get('duration');
		    	if (secString == undefined) {

		    	} else {
		    		var secs = parseFloat( results[i].get('duration') );
		    		addTheMinutes(secs);
		    	};
		    };
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});

		var allSeconds = 0;
		function addTheMinutes(num) {
			allSeconds = allSeconds + num;
			$scope.totalMins = Math.round(allSeconds / 60);
			$scope.$apply();
		};

		$scope.theDuration;
		
		function getRecordings (){
			var thou;
			var hund;
			var extraZero;
			console.log('trying to get the recording minutes');
			Parse.Cloud.run('getTotalRecordings', {
      		 "type": "total"
    		}, {
    			success: function(result) {
    				console.log(result);
    					var total = 0;
						$.each(result, function () {
						    total += (this / 60);
						});
						console.log(total);
    				if (total >= 1000) {
    					thou = Math.floor(total/1000);
    					hund = Math.floor(total - (thou*1000));
    					if (hund <100) {
    						extraZero = 0;
    					} else {
    						extraZero ="";
    					};
    				$scope.theDuration = thou + "," + extraZero + hund;
    				$scope.$apply();
    				} else {
    				$scope.theDuration = Math.floor(total);
    				$scope.$apply();
    				};

    				
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};
		
		getRecordings();
  }]);