cdApp.controller('InterviewsCtrl', 
   	['$scope', '$location', 
   	function ($scope, $location) {
   			var currentUser = Parse.User.current();
  			var Interviews = Parse.Object.extend("Interviews");
			var query = new Parse.Query(Interviews);

			query.equalTo("user", currentUser);
			query.find({
			  success: function(results) {
			    $scope.interviews = results;
			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

	$scope.goToPage = function(path){
		$location.path(path);
		
	};
		
  }]);