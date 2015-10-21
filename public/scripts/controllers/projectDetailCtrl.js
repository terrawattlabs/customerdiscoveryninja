cdApp.controller('ProjDetailCtrl', 
   	['$scope', '$timeout', '$routeParams', '$location', 
   	function ($scope, $timeout, $routeParams, $location) {
   		var projID = $routeParams.selID;
   		var project;

   		$scope.maxRating = 5;

   		//establish the scope ojects
   		$scope.interviews;
   		$scope.questionList;

   		//pull the project
   		var Projects = Parse.Object.extend("Projects");
		var query = new Parse.Query(Projects);

		query.equalTo("objectId", projID);
		query.find({
		  success: function(results) {
		    $scope.selproject = results[0];
		    project = results[0];
		    displayShared();
		    $scope.$apply();
		    findInterviews(results[0]);
		    findQuestions(results[0]);
		    findTemplates(results[0]);
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});
		//pull the recent interviews on the project
		$scope.nextInterval;
		function findInterviews(proj) {
			var Interviews = Parse.Object.extend("Interviews");
			var intQuery = new Parse.Query(Interviews);

			intQuery.equalTo("project", proj);
			intQuery.descending("updatedAt");
			//intQuery.limit(10);
			intQuery.find({
			  success: function(results) {
			  	$scope.numInterviews = results.length;
			  	$scope.nextInterval = 100;
			  	$scope.$apply();
			  	//pass results to a function to conver the date.. includes target
			  	convertAndPushDates(results, '$scope.interviews');
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};
		$scope.max = function () {
			return $scope.nextInterval;
		};

		//pull the recent questions
		function findQuestions(proj) {
			var Questions = Parse.Object.extend("Questions");
			var quesQuery = new Parse.Query(Questions);

			quesQuery.equalTo("project", proj);
			quesQuery.descending("updatedAt");
			quesQuery.limit(10);
			quesQuery.find({
			  success: function(results) {
			    convertAndPushDates(results, '$scope.questionList');
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};
		//pull the recent questions
		function findTemplates(proj) {
			var IntTemplate = Parse.Object.extend("IntTemplate");
			var tempQuery = new Parse.Query(IntTemplate);

			tempQuery.equalTo("project", proj);
			tempQuery.descending("updatedAt");
			tempQuery.limit(10);
			tempQuery.find({
			  success: function(results) {
			  	console.log(results);
			    convertAndPushDates(results, '$scope.templateList');
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};


		function convertAndPushDates (data, target) {
				var obj = data;
			for (var i = data.length - 1; i >= 0; i--) {
				//get the createdAT info
				var jsDate = new Date(data[i].createdAt); 
				var year = jsDate.getFullYear();
				var month = jsDate.getMonth() + 1;
				var day = jsDate.getDate();
				var hours = jsDate.getHours();
				var minutes = jsDate.getMinutes();
					if (minutes < 10) {
						minutes = "0" + minutes;
					};
				var createdAtReadableDate = hours + ":" + minutes + " on " + month + "/" + day + "/" + year;
				data[i].createdAtReadable = createdAtReadableDate;
				data[i].theRating = data[i].get('rating');

				if (i == 0) {
					applyToScope(target, obj);
				};
			};
		};

		function applyToScope (targetScope, obj) {
			if (targetScope == "$scope.interviews") { 
				$scope.interviews = obj;
			} if (targetScope == "$scope.questionList") {
				$scope.questionList = obj;
			} if (targetScope == "$scope.templateList") {
				$scope.templateList = obj;
			};
			$scope.$apply();
		};
		
	$scope.goToPage = function(path){
		$location.path(path);
		
	};

	//show the shared users 
	var shareArraySave = [];

	function displayShared () {
			var userList = project.get('sharedUsers');
			var query = new Parse.Query(Parse.User);
		for (var i = userList.length - 1; i >= 0; i--) {
			query.get(userList[i].id, {
			  success: function(object) {
			    shareArraySave.push(object);

			  },

			  error: function(object, error) {
			  }
			});	
			if (i == 0) {
				displayUsers();
			};
		};

	};

	function displayUsers() {
		$scope.sharedUsers = shareArraySave;
	};




	// UPDATE SHARED USERS Start ----------------------------------------------------------------------------------
	//save and update the list of shared users on a project

	

   		$scope.shareWithUpdate = function () {
  			
  			var share = $scope.shareWith;
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
  // UPDATE SHARED USERS END ----------------------------------------------------------------------------------


 			
   	}]);