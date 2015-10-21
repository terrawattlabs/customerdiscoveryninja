cdApp.controller('NewInterviewCtrl', 
  	['$scope', '$location', 'growl', 'intCounterFactory', '$window', '$routeParams',
  	function ($scope, $location, growl, intCounterFactory, $window, $routeParams) {
  		var currentUser = Parse.User.current();
  		$scope.usersBalance = currentUser.get('balance');
  		$scope.confirmcodePopover="Keep it simple. Give this code to the person you interview when it's over.";
  	
  		$scope.title;
  		$scope.titlePlaceholder ="'travel'";
  		$scope.descriptionPlaceholder = "'has flown in the past 6 months'";
  		$scope.confirmCodePlaceholder = "'flight'";
  		$scope.description;
  		$scope.confirm = {
  			"code": ""
  		};

  		//pull the project
   		var Projects = Parse.Object.extend("Projects");
		var query = new Parse.Query(Projects);
		var selectedProject = $routeParams.projID;
		var selectedProjectObject;

		query.equalTo("objectId", selectedProject);
		query.find({
		  success: function(results) {
		    selectedProjectObject = results[0];
		    console.log(selectedProjectObject);
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});

  		$scope.checkready = function () {
  			var ready = true;


  			if ($scope.title !== "" && $scope.description !== "" && $scope.confirm.code !== "" && $scope.reqInterviews !== "") {
  				ready = false;
  			};
  			return ready;
  		};

  		$scope.newHIT = function () {
  			var Amthits = Parse.Object.extend("Amthits");
			var amhits = new Amthits();

				var title = "10-15 minute phone interview related to " + $scope.title;
		  		var phone = currentUser.get('number');
		  		var reward = $scope.reward;
		  		var description = "A 10-15 minute phone interview with anyone who " + $scope.description;
		  		var reqInterviews = $scope.reqInterviews;
		  		var keywords = $scope.keywords;
		  		var status = "pending";
		  		var confirm = $scope.confirm.code;
		  		var duration = reqInterviews * 0.4 * 60;

		  		console.log(keywords);

			amhits.set("title", title);
			amhits.set("phone", phone);
		    amhits.set("reward", reward);
		    amhits.set("reqInterviews", reqInterviews);
			amhits.set("description", description);
			amhits.set("status", status);
			amhits.set("confirm", confirm);
			amhits.set("user", currentUser);
			amhits.set("duration", duration);
			amhits.set("completed", 0);

			if (reqInterviews <= $scope.usersBalance) {
				amhits.save(null, {
	 			 success: function(amhit) {
	 			 	//notify(amhit.id);

	 			 	
	 			 	intCounterFactory.pullOpenIntReq(currentUser, "initial").then(function (interview){
			   		 	// this just updates the navbar so that an int request is shown
			   		 	console.log('got something bacvk from the factory');
			   		 	
			   		 });


			    // Execute any logic that should take place after the object is saved.
			    //growl.addSuccessMessage("The Interview Request Was Created!");
				 currentUser.save(null, {
					success: function(user) {
						currentUser.save();
						$scope.$apply( function() {
					    	$location.path('/dashboard');
					     });
					}
				});
			    $window.location.reload();
	  			},
				  error: function(amhit, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
	  				}
			});
			} else {
				alert('You requested ' + reqInterviews + ' interviews but only have a balance of ' + $scope.usersBalance + ' interview credits. Buy more credits or request fewer interviews');
			}
			
  		};

  		$scope.saveTemplate = function () {
  			var IntTemplate = Parse.Object.extend("IntTemplate");
			var inttemplate = new IntTemplate();

			if ($routeParams.templateID == "new") {
				//if requesting to make a new template, post a new template
				var title = $scope.title;
		  		var description = $scope.description;
		  		var reqInterviews = $scope.reqInterviews;
		  		var confirm = $scope.confirm.code;
		  		var relatedProject = $routeParams.projID;
			 
				inttemplate.set("title", title);
				inttemplate.set("description", description);
				inttemplate.set("confirm", confirm);
				inttemplate.set("reqInterviews", reqInterviews);
				inttemplate.set("project", selectedProjectObject);
				 
				inttemplate.save(null, {
				  success: function(inttemplate) {
				    // Execute any logic that should take place after the object is saved.
				    growl.addSuccessMessage('Template Saved');
				  },
				  error: function(inttemplate, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
			} else {
				console.log('i would have saved the template');
				var title = $scope.title;
		  		var description = $scope.description;
		  		var reqInterviews = $scope.reqInterviews;
		  		var confirm = $scope.confirm.code;
		  		var relatedProject = $routeParams.projID;
			 
				openedTemplate.set("title", title);
				openedTemplate.set("description", description);
				openedTemplate.set("confirm", confirm);
				openedTemplate.set("reqInterviews", reqInterviews);
				openedTemplate.set("project", selectedProjectObject);

				openedTemplate.save(null, {
				  success: function(inttemplate) {
				    // Execute any logic that should take place after the object is saved.
				    growl.addSuccessMessage('Template Saved');
				  },
				  error: function(inttemplate, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});


			};	
  		}; // end save template

  		var openedTemplate;
  		if ($routeParams.templateID !== "new") {
  			var IntTemplate = Parse.Object.extend("IntTemplate");
			var query = new Parse.Query(IntTemplate);
			var openedTemplateID = $routeParams.templateID;

			query.get(openedTemplateID, {
			  success: function(temp) {
			    $scope.title = temp.get('title');
			    $scope.description = temp.get('description');
			    $scope.reqInterviews = temp.get('reqInterviews');
			    $scope.confirm.code = temp.get('confirm');
			    openedTemplate = temp;
			    $scope.$apply();
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and message.
			  }
			});
  		};

  		function notify (id) {
   			console.log(id);
			Parse.Cloud.run('notifyTexts', {
      		  "item": "AMT", 
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