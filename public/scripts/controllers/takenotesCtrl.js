cdApp.controller('TakeNotesCtrl', 
  	['$scope', '$location', 'shareCallSID', 'growl', 
  	function ($scope, $location, shareCallSID, growl) {
  		var currentUser = Parse.User.current();
  		$scope.newInterview = function () {
  			console.log('interview fired');
  			console.log($scope.project);
  			var Interviews = Parse.Object.extend("Interviews");
			var interviews = new Interviews();

				var name = $scope.name;
		  		var phone = $scope.phone;
		  		var notes = $scope.notes;
		  		var callSID = shareCallSID.getcallSID();
		  		var project = $scope.selproject;
		  		var rating = $scope.rate;
		  		var takeaway = $scope.takeaway;

			interviews.set("name", name);
			interviews.set("phone", phone);
			interviews.set("notes", notes);
			interviews.set("user", currentUser);
			interviews.set("callSID", callSID);
			interviews.set("project", project);
			interviews.set("rating", rating);
			interviews.set("takeaway", takeaway);


			interviews.save(null, {
	 			 success: function(interview) {
			    // Execute any logic that should take place after the object is saved.
			    growl.addSuccessMessage("Note Saved!");
			    // deduct interviews from the balance of the user
			     $scope.$apply( function() {
			    $location.path('/projdetail/' + project.id);
			      	});
	  			},
				  error: function(amhit, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
	  				}
			});
  		};

  		function pullQuestions(prj) {
  			//get the notes for this interview
  		var Questions = Parse.Object.extend("Questions");
		var questionQuery = new Parse.Query(Questions);

//needs updating to pull the correct questions basedon the selected project
			questionQuery.equalTo("project", prj);
			questionQuery.find({
			  success: function(results) {
			    $scope.prompt = results[0];
			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
  		};
  		


		// pull the user's list of projects that he owns
   		var Projects = Parse.Object.extend("Projects");

		var thisUserQuery = new Parse.Query(Projects);
		thisUserQuery.equalTo("user", currentUser);

		var sharedUserQuery = new Parse.Query(Projects);
		sharedUserQuery.equalTo("sharedUsers", currentUser);

		var mainQuery = new Parse.Query.or(thisUserQuery, sharedUserQuery);

		mainQuery.find({
		  success: function(results) {
		    $scope.userProjs = results;
		    $scope.$apply();
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});


	var defaultProj = currentUser.get('defaultProj').id;
	

	var defaultQuery = new Parse.Query(Projects);

	defaultQuery.get(defaultProj, {
		  success: function(prj) {
		    $scope.defaultProject = prj;
		    $scope.selproject = prj;
		    pullQuestions(prj);
		  },
		  error: function(prj, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and description.
		  }
		});

	$scope.changeSelectedProject = function (proj) {
		console.log(proj);
		console.log('in function');
		$scope.selproject = proj;
		pullQuestions(proj);
		growl.addInfoMessage("Project Changed!", {ttl: 1500});
	};



  $scope.rate = 0;
  $scope.max = 5;
  $scope.isReadonly = false;

  var messages = ["Not a Customer", "Unlikely Customer", "Future Customer", "Early Adopter", "First Customer"];

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    console.log(value);
    $scope.helper = messages[value - 1];
    console.log($scope.helper);
  };

  $scope.ratingStates = [
    {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
    {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
    {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
    {stateOn: 'glyphicon-heart'},
    {stateOff: 'glyphicon-off'}
  ];

  }]);