cdApp.controller('ProjCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$location', 
   	function ($scope, $timeout, $routeParams, growl, $location) {

   			var currentUser = Parse.User.current();
   			var showTheProj = false;

   		$scope.showNewProj = function (){

   			showTheProj = true;


   		};


   		$scope.newProj = function (){
   			return showTheProj
   		};

   		var shareArraySave = [];

   		$scope.newProject = function () {
  			
  			var share = $scope.projShare;
  			if (share) {
  				var shareArray = share.split(',');

  			// first need to create the array of users that can see that project
  			for (var i = shareArray.length - 1; i >= 0; i--) {
  				var remaining = i;
   				var noSpaceUser = shareArray[i].replace(/\s+/g, '');
   				var user = new Parse.User();
  				var query = new Parse.Query(Parse.User);
  				query.equalTo("username", noSpaceUser);
  				
  				query.find({
				  success: function(result) {
				  		shareArraySave.push(result[0]);
				  		console.log(shareArraySave);
				  		growl.addSuccessMessage("Project Shared with " + result[0].get('name'));
				  		if (remaining == 0) {
							saveProject(); // now save the project
						};
				  },
				  error: function(error) {
				   growl.addErrorMessage("Could Not Find User: " + noSpaceUser);
				  }
				});
  				
					
   				};
  			} else {
  				saveProject();
  			};
  			
   		};

   		function saveProject() {
   			var Projects = Parse.Object.extend("Projects");
  			var project = new Projects();

  			var title = $scope.projTitle;
  			var description = $scope.projDesc;

  				project.set("title", title);
				project.set("description", description);
				project.set("user", currentUser);
				project.set("sharedUsers", shareArraySave);
				 
				project.save(null, {
				  success: function(proj) {
				    growl.addSuccessMessage("Project Saved!");
				    $scope.$apply( function() {
			    		$location.path('/projects');
			     	});
			     	
				  },
				  error: function(proj, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
   		};


   		// pull the user's list of projects that he owns
   		var Projects = Parse.Object.extend("Projects");
		var query = new Parse.Query(Projects);
		query.equalTo("user", currentUser);
		query.find({
		  success: function(results) {
		    $scope.userProjectList = results;
		    $scope.$apply();
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});

		var sharedQuery = new Parse.Query(Projects);
		sharedQuery.equalTo("sharedUsers", currentUser);

		sharedQuery.find({
		  success: function(results) {
		    $scope.sharedProjectList = results;
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