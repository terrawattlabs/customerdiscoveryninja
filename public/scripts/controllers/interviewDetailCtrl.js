cdApp.controller('InterviewDetailCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$location',
   	function ($scope, $timeout, $routeParams, growl, $location) {

   		$scope.selprojectID = $routeParams.projectID;
   		$scope.oneAtATime = true;

   			var currentUser = Parse.User.current();
  			var Interviews = Parse.Object.extend("Interviews");
			var query = new Parse.Query(Interviews);
			var queryResult;

			query.equalTo("objectId", $routeParams.selID);


			query.find({
			  success: function(result) {
			  	queryResult = result;
			    var interview = result[0];
			    $scope.interview = interview;
			    $scope.name = interview.get('name');
			    $scope.rate = interview.get('rating');
			    $scope.notes = interview.get('notes');
			    $scope.takeaway = interview.get('takeaway');

			    $scope.$apply();
			    getRecording(interview);
			    convertAndPushDates(interview);
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});


			  $scope.max = 5;
			  $scope.isReadonly = false;

			  var messages = ["Not a Customer", "Unlikely Customer", "Future Customer", "Early Adopter", "First Customer"];
			  console.log(messages.length);
			  console.log(messages[0]);

			  $scope.hoveringOver = function(value) {
			    $scope.overStar = value;
			    console.log(value);
			    $scope.helper = messages[value - 1];
			    console.log($scope.helper);
			  };
 		
 		//get the recording
 		function getRecording(obj) {
 			console.log(obj);
 			var interviewCallSID = obj.get('callSID');
 			//console.log(interviewCallSID);
 			var Message = Parse.Object.extend("Message");
			var query = new Parse.Query(Message);

			query.equalTo("sid", interviewCallSID);
			query.find({
			  success: function(result) {
			    $scope.recording = result[0];
			    //console.log(result[0]);
			    $scope.recordingURL = result[0].get('location');
			    $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

 		};

	$scope.$watch('recordingURL', function() {
       $("audio").attr("src",$scope.recordingURL)
   });

	function convertAndPushDates (data) {
				var jsDate = new Date(data.createdAt); 
				var year = jsDate.getFullYear();
				var month = jsDate.getMonth() + 1;
				var day = jsDate.getDate();
				var hours = jsDate.getHours();
				var minutes = jsDate.getMinutes();
					if (minutes < 10) {
						minutes = "0" + minutes;
					};
				var createdAtReadableDate = hours + ":" + minutes + " on " + month + "/" + day + "/" + year;
				$scope.readableDate = createdAtReadableDate;
				$scope.$apply();

			};


 	$scope.updateNotes = function() {

 				var newNotes = $scope.notes;
 				var newName = $scope.name;
 				var newRating = $scope.rate;
 				var newTakeaway = $scope.takeaway;
	 			var Interviews = Parse.Object.extend("Interviews");
				var query = new Parse.Query(Interviews);

				query.equalTo("objectId", $routeParams.selID);

				query.first({
				  success: function(object) {
				     object.set("notes", newNotes);
				     object.set("name", newName);
				     object.set("rating", newRating);
				     object.set("takeaway", newTakeaway);
				   	 object.save();
				   	 makeNotification("success", "Notes Saved!");
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
 	}; //end update notes

 	$scope.goToPage = function(path){
		$location.path(path);
	};
 	
 	function makeNotification (type, msg) {
 		console.log('running notification function');
 		if (type == "success") {
 			console.log('type was success');
 			growl.addSuccessMessage(msg);
 		};
 		console.log(msg);
 	};

 	$scope.options = {
	  playlist: ['./assets/beep-02.mp3'],
	  loop: true
		};


}]);