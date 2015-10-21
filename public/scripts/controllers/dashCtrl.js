cdApp.controller('DashCtrl', 
  	['$scope', '$location', '$modal', '$log', 'growl', 'intCounterFactory',
  	function ($scope, $location, $modal, $log, growl, intCounterFactory) {
   		 var currentUser = Parse.User.current();
		 var Amthits = Parse.Object.extend("Amthits");
		 var query = new Parse.Query(Amthits);

			query.equalTo("user", currentUser);
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


// begin modal for new project

$scope.open = function (size) {

		    var modalInstance = $modal.open({
		      templateUrl: 'myModalContent.html',
		      controller: ModalInstanceCtrl,
		      size: size,
		      resolve: {
		        items: function () {
		          return $scope.items;
		        }
		      }
		    });

		    modalInstance.result.then(function (selectedItem) {
		      $scope.selected = selectedItem;
		    }, function () {
		      $log.info('Modal dismissed at: ' + new Date());
		    });
		  };


		 var ModalInstanceCtrl = function ($scope, $modalInstance, items) {
		 	var shareArraySave = [];

		 	$scope.setFormReference = function(newProjectForm) { 
		 		$scope.newProjectForm = newProjectForm;
		 		$scope.newProjectForm.title;
		 		$scope.newProjectForm.description;
		 		$scope.newProjectForm.projShare;
		 	};

		 	$scope.submitNewProject = function () {
		 		var share = $scope.newProjectForm.projShare;
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
		 		$modalInstance.close('closed');
		 	};

		 	function saveProject() {
   			var Projects = Parse.Object.extend("Projects");
  			var project = new Projects();

  			var title = $scope.newProjectForm.title;
  			var description = $scope.newProjectForm.description;

  				project.set("title", title);
				project.set("description", description);
				project.set("user", currentUser);
				project.set("sharedUsers", shareArraySave);
				 
				project.save(null, {
				  success: function(proj) {
				    growl.addSuccessMessage("Project Saved!");
				    checkDefaultProj(proj);
				    $scope.$apply( function() {
			    		$location.path('/projdetail/' + proj.id);
			     	});
			     	
				  },
				  error: function(proj, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
   		};


   			function checkDefaultProj (proj) {
   				if (!currentUser.get('defaultProj')) {
	   					currentUser.save(null, {
						success: function(user) {
							currentUser.set("defaultProj", proj);
							currentUser.save();
						}
					});
   				};
   			};


			  // $scope.ok = function () {
			  // 	console.log($scope.myForm);
			  // 	console.log($scope.testInput);
			  //   $modalInstance.close('closed');
			  // };

			  $scope.cancel = function () {
			    $modalInstance.dismiss('cancel');
			  };
			};

  }]);