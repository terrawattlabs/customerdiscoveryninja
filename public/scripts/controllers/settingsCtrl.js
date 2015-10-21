cdApp.controller('SettingsCtrl', 
   	['$scope', '$location', '$modal', '$log', 'growl',
   	function ($scope, $location, $modal, $log, growl) {
   		var currentUser = Parse.User.current();
   		var credits;
   		var chargeAmount;
   		var discountPerc = 0;
   		var totalCost;
   		var userEmail = currentUser.get("email");

   		//starting value for radio model, will be updated when user selects a package
   	$scope.radiomodel = {
   		id: undefined
   	};


   	$scope.packages = [
   		{"id": 0, "credits": 1, "cost": 5},
   		{"id": 1, "credits": 5, "cost": 25},
   		{"id": 2, "credits": 10, "cost": 45},
   		{"id": 3, "credits": 100, "cost": 400}
   	];


   		$scope.costUpdate = function () {
   			chargeAmount = $scope.packages[$scope.radiomodel.id].cost;
   			totalCost = chargeAmount * (1 - discountPerc);
   			$scope.totalCost = totalCost;
   			if (discountPerc > 0) {
   				$scope.savingMsg = "You're Saving $" + discountPerc * chargeAmount;
   			};

   			credits = $scope.packages[$scope.radiomodel.id].credits;
   			
   			$scope.btnMsg = "$" + totalCost + " for " + credits + " credits";
   		};



   		$scope.findCoupon = function() {
		var validCode = "alphauser";
		var given = $scope.givenCode;
		$scope.couponMsg="";
		if (validCode == given) {
			$scope.couponMsg = "Awesome, that's 50% off!";
			growl.addSuccessMessage("Coupon Added!");
			discountPerc = 0.5;
			$scope.costUpdate();
			$scope.savingMsg = "You're Saving $" + discountPerc * chargeAmount;

		};
	};

   		function getUser() {
   			if (currentUser) {
				$scope.apiID = currentUser.id;
				$scope.twilID = currentUser.get('twilioSID');
				$scope.twilAuth = currentUser.get('twilioAuth');
			} else {
  		  	// show the signup or login page
			};
   		};
		
		getUser();

	$scope.saveTwil = function () {
		var twilioSID = $scope.twilID;
		var twilioAuth = $scope.twilAuth;
		currentUser.save(null, {
			success: function(user) {
				currentUser.set("twilioSID", twilioSID);
				currentUser.set("twilioAuth", twilioAuth);
				currentUser.save();
			}
		});
	};

	$scope.usersNumber = currentUser.get('number');
	$scope.usersBalance = currentUser.get('balance');


	$scope.handleStripe = function(status, response){
        if(response.error) {
          growl.addErrorMessage('It did not work. try again')
        } else {
          // got stripe token, now charge it or smt
          
          var token = response.id;

          Parse.Cloud.run('createPayment', {
		      		  "token": token,
		      		  "dollars": totalCost,
		      		  "email": userEmail,
		      		  "desc": credits + " Interview Credits on Customer Discovery Ninja"
		    		}, {
		    			success: function(result) {
		    			 console.log(result);
		    			 newTransaction();

		    		},
					    error: function(error) {
					      console.log(error);
					    }
		  			});
        }
    };
	

		// create a new transaction for the transaction list
		function newTransaction () {
				//create a new transaction
				var Transaction = Parse.Object.extend("Transaction");
				var transaction = new Transaction();
				 
				transaction.set("credits", credits);
				transaction.set("dollars", chargeAmount);
				transaction.set("type", "purchase");
				transaction.set("status", "processed");
				transaction.set("user", currentUser);
				 
				transaction.save(null, {
				  success: function(transaction) {
				    updateBalance();
				    growl.addSuccessMessage('You have added ' + credits + ' new credits!');
				  },
				  error: function(transaction, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
				
			}; //end new transaction
		// update the customer's balance
		function updateBalance() {
			currentUser.save(null, {
			success: function(user) {
				currentUser.increment("balance", + credits);
				currentUser.save();
				$scope.$apply( function() {
			    	$location.path('/dashboard');
			     	});

			}
		});
		};

	// pull a list of transactions for that user limit to last 5
		var Transaction = Parse.Object.extend("Transaction");
		var query = new Parse.Query(Transaction);

			query.equalTo("user", currentUser);
			query.limit(10);
			query.find({
			  success: function(result) {
			    $scope.transList = result;
			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});


		

	



 }]);