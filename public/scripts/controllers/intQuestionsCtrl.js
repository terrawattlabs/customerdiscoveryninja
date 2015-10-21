cdApp.controller('IntQuestionsCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$location', 
   	function ($scope, $timeout, $routeParams, growl, $location) {
   		var selectedProject = $routeParams.projID;
   		var selectedQuestion = $routeParams.questID;
   		var selectedProjectObject;
   		var currentUser = Parse.User.current();
   		var Questions = Parse.Object.extend("Questions");

   		//pull the project
   		var Projects = Parse.Object.extend("Projects");
		var query = new Parse.Query(Projects);

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

				var getQuestionQuery = new Parse.Query(Questions);
  				getQuestionQuery.get(selectedQuestion, {
				  success: function(ques) {
				    	$scope.questions = ques.get('questions');
				    	$scope.title = ques.get('title');
				    	$scope.$apply();
				  },
				  error: function(object, error) {
				    // The object was not retrieved successfully.
				    // error is a Parse.Error with an error code and description.
				  }
			});



		 $scope.checkNew = function (){
			if (selectedQuestion == "new") {
				getQuestion();
				return true
			} else {
				return false
			}
		};



   		$scope.newQuestions = function () {
   				var title = $scope.title;
		  		var quest = $scope.questions;
  			
  			if (selectedQuestion == "new") {
  				//create a new question
  				var questions = new Questions();

		  		

				questions.set("title", title);
				questions.set("questions", quest);
				questions.set("user", currentUser);
				questions.set("project", selectedProjectObject);
				 
				questions.save(null, {
				  success: function(question) {
				    growl.addSuccessMessage("Questions Saved!");
				    $scope.$apply( function() {
			    		$location.path('/projdetail/' + question.get('project').id);
			     	});
				  },
				  error: function(transaction, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
  			} else {
  					// Create a pointer to an object of class Point with id dlkj83d
					var Point = Parse.Object.extend("Questions");
					var point = new Point();
					point.id = selectedQuestion;

					// Set a new value on quantity
					point.set("questions", quest);
					point.set("title", title);

					// Save
					point.save(null, {
					  success: function(point) {
					  	growl.addSuccessMessage("Questions Saved!");
					    console.log('saved');
					  },
					  error: function(point, error) {
					    // The save failed.
					    // error is a Parse.Error with an error code and description.
					  }
					});
		  			}; // end else block
		   	};// end new question function

		   	$scope.returnToProject = function() {
		   		console.log('tried to return to project');
		   		
			    $location.path('/projdetail/' + selectedProjectObject.id);
		
		   	};
   	}]);