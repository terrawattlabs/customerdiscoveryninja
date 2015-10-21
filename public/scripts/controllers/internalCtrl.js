cdApp.controller('InternalCtrl', 
   	['$scope', '$route', 
   	function ($scope, $route) {
   		function getHits() {
   			console.log('getting hits');
  			var Amthits = Parse.Object.extend("Amthits");
			var query = new Parse.Query(Amthits);
			//query.equalTo("status", "pending");
			query.descending("updatedAt");
			query.find({
			  success: function(results) {
			    $scope.requests = results;
			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};
		getHits();
			
			//set a statusSelect scope for each item in the list



		$scope.updateStatus = function (id, status) {
			console.log('running the function');
			var Amthits = Parse.Object.extend("Amthits");
			var query = new Parse.Query(Amthits);
			var newStatus = status;
			console.log(newStatus);
			query.get(id, {
			  success: function(hit) {
			  	console.log('found this hit');
			  	console.log(hit);
			    	hit.save(null, {
						success: function(user) {
							hit.set("status", newStatus);
							hit.save();
							console.log('saved the hit');
							$route.reload();
						}
					});
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});
		};

  }]);