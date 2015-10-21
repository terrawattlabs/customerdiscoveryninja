
cdApp.controller('LoginCtrl', 
   	['$scope', '$location', '$window',
   	function ($scope, $location, $window) {
   		

   		$scope.newUser = function () {
   			var user = new Parse.User();
   			var userEmail = $scope.email;
	   		var userName = $scope.name;
	   		var userPass = $scope.password;
	   		var userNumber = "";

			user.set("username", userEmail);
			user.set("password", userPass);
			user.set("email", userEmail);
			user.set("name", userName);
			user.set("number", userNumber);
			user.set("balance", 0)
			user.set("twilioSID", "AC73f7249b29a458ccfb05e1ca469023aa");
			user.set("twilioAuth", "da9c29a9a9ceda42b101242c8b5bfdb9");
		 
			user.signUp(null, {
			  success: function(user) {
			  	notify(user.id);
			    $scope.$apply( function() {
			    	$location.path('/dashboard');
			     	});
			    $window.location.reload();
			  },
			  error: function(user, error) {
			    // Show the error message somewhere and let the user try again.
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

   		};//end new user
   		
   		$scope.login = function () {
   			var myemail = $scope.loginEmail;
   			var mypass = $scope.loginPass
   			Parse.User.logIn(myemail, mypass, {

				  success: function(user) {
			
				    console.log('logged in buddy');
				    $scope.$apply( function() {
			    		$location.path('/dashboard');
						
			     	});
			     	$window.location.reload();
				  },
				  error: function(user, error) {
				    // The login failed. Check error to see why.
				  }
			});
   		};

   		function notify (id) {
   			console.log(id);
			Parse.Cloud.run('notifyTexts', {
      		  "item": "twilio", 
        	  "ID": id
    		}, {
    			success: function(result) {
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};


   	}]);