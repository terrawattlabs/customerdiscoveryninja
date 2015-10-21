'use strict';

var cdApp = angular.module('cdApp');

cdApp.config(['growlProvider',
	function (growlProvider){
		growlProvider.globalTimeToLive(5000);
	}]);

cdApp.config(function (uiSelectConfig) {
  uiSelectConfig.theme = 'bootstrap';
});


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

  cdApp.controller('NavCtrl',
   ['$scope', '$location', '$window', '$interval', '$route', '$anchorScroll', '$timeout', 'locationService', 'growl',
    function ($scope, $location, $window, $interval, $route, $anchorScroll, $timeout, locationService, growl) {
   		 var currentUser = Parse.User.current();

   		 	if (currentUser) {
   		 		if (currentUser.get('customerID')) {
			    console.log('looks like we found a customer ID');
			} else {
				console.log(currentUser.get('customerID'));
				console.log('made it to the else block, no user ID');
			    $location.path('/setup');
			    //growl.addErrorMessage("Hmm... it doesn't look like you have a subscription, please enter payment info!");
			};
   		
   		 	};
   		 	 

   		 $scope.currentUser = currentUser;
   		 console.log(currentUser);

		  $scope.logOut = function () {
	    	Parse.User.logOut();
	    	console.log('logged out');
		
			 $scope.goToPage('/');

			 $timeout(reloadPage, 500);

    	};

    	$scope.goToPage = function(path){
		$location.path(path);
		
	};
		
		$scope.inSetup = function () {
			var theLocation = locationService.getLocation();
			var isInSetup = true;
			if (theLocation == '/setup') {
				isInSetup = true;
			};
			return isInSetup;
		};

		function reloadPage () {
  			$window.location.reload();
  		};


    	function LogItOut (){
    		$scope.$apply( function() {
			    	$location.path('/');
			     	});
    		$route.reload();
    	};

    	$scope.isActive = function (viewLocation) { 
        	return viewLocation === $location.path();
    	};

    	$scope.isLoggedIn = function (){
    		var loggedIn = false;
    		if (currentUser) {
    			loggedIn = true;
    		};

    		return loggedIn;
    	};


    	var Message = Parse.Object.extend("Message");
		var query = new Parse.Query(Message);
		query.find({
		  success: function(results) {
		    for (var i = results.length - 1; i >= 0; i--) {
		    	var secString = results[i].get('duration');
		    	if (secString == undefined) {

		    	} else {
		    		var secs = parseFloat( results[i].get('duration') );
		    		addTheMinutes(secs);
		    	};
		    };
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});

		var allSeconds = 0;
		function addTheMinutes(num) {
			allSeconds = allSeconds + num;
			$scope.totalMins = Math.round(allSeconds / 60);
			$scope.$apply();
		};

		$scope.theDuration;
		
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

		function getRecordings (){
			var thou;
			var hund;
			var extraZero;
			console.log('trying to get the recording minutes');
			Parse.Cloud.run('getTotalRecordings', {
      		 "type": "total"
    		}, {
    			success: function(result) {
    					var total = 0;
						$.each(result, function () {
						    total += (this / 60);
						});
    				total = Math.floor(total);
    				var processedNumber = numberWithCommas(total);
    				$scope.theDuration = processedNumber;
    				$scope.$apply();

    				
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};
		
		getRecordings();

		$scope.scrollTo = function(id) {
		    $location.hash(id);
		    console.log($location.hash());
		    $anchorScroll();
		  };

  }]);



cdApp.controller('counterCtrl',
   ['$scope', '$location', '$window', '$interval', '$route', 'intCounterFactory',
    function ($scope, $location, $window, $interval, $route, intCounterFactory) {
   		 var currentUser = Parse.User.current();
   		 $scope.currentUser = currentUser;
   		 $scope.totalInts = "";
   		 var openInt;
   		 var completed;
   		 var reqInts;
   		 var endDate;
   		 var duration;

   		 var showingTimer = false;
   		

   		 function initializeTimer (type){
   		 	 showingTimer = true;
   		 	 console.log('pull info run');
   		 	 intCounterFactory.pullOpenIntReq(currentUser, "initial").then(function (interview){
   		 	 openInt = interview;
   		 	 var reqInts = openInt.get('reqInterviews');
		     createPopUpMsg(reqInts, completed);
		     var endDate = openInt.createdAt;
		     var duration = openInt.get('duration');
		     processDate(endDate, duration, openInt);
   		 	});
   		 };

   		 	initializeTimer();
   		
   		


   		 	$scope.completedInts = intCounterFactory.getIntCount;
   		

   		 	var completed = $scope.completedInts();

   		 var timeLeftMin;
   		 var timeLeft;
   		 function processDate(end, dur, openInt){
   		 	var startDate = new Date(end);
   		 	var addTime = dur * 60000;
   		 	var ending = new Date(startDate.getTime() + addTime);
   		 	var now = new Date();
   		 	timeLeft = (ending - now) / 1000;

   		 	if (timeLeft <= 0) {
   		 		updateIntStatus(openInt, "closed");
   		 		console.log('there is less than 0 time, should be updated');
   		 	} else {
   		 		timeLeftMin = timeLeft / 60;
   		 		initRemainingTimer();

   		 		
   		 	};
   		 	
   		 };

   		 function updateIntStatus(interview, status){
   		 	var intId = interview.id;
   		 	var Amthits = Parse.Object.extend("Amthits");
   		 	var query = new Parse.Query(Amthits);;

   		 	query.get(intId, {
			  success: function(hit) {
			    	hit.save(null, {
						success: function(user) {
							hit.set("status", status);
							hit.save();
							console.log('saved the hit should be updated to closed');
						}
					});
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});

   		 };

   		 var theTimer;
   		 function initRemainingTimer(){
   		 	console.log('timer initied');
   		 	theTimer = $interval(remainingTimer, 1000);
   		 };

   		 function remainingTimer() {
   		 	if (timeLeft <= 0) {
   		 		console.log("Time Left is zero");
   		 		updateIntStatus(openInt, "closed");
   		 		$interval.cancel(theTimer);
   		 		$scope.timerMsg = "0:0:00 Remaining";
   		 		$interval(function(){
   		 			ifOpenInt = false;
   		 		}, 10000, 1);
   		 	} else {
   		 		var hours;
	   		 	if (timeLeft >= 3600) {
	   		 		hours = Math.floor(timeLeft / 3600);
	   		 		
	   		 	} else {
	   		 		hours = 0;
	   		 	};
	   		 		var minutes = Math.floor((timeLeft - (hours * 3600))/60);
	   		 		var seconds = Math.floor(timeLeft - (hours * 3600) - (minutes * 60));
	   		 		$scope.timerMsg = hours + ":" + minutes + ":" + seconds + " Remaining";
	   		 		
	   		 	timeLeft = timeLeft - 1;
   		 };
   		 	
   		 };


   		 $scope.checkOpenInt = function(){
   		 		var theCheck = intCounterFactory.getOpenIntCheck();
   		 	return theCheck;
   		 };


   		 $scope.checkLoggedIn = function (){
    		var loggedIn = false;
    		if (currentUser && !(currentUser.get('number') == "") ) {
    			loggedIn = true;
    		};

    		return loggedIn;
    	};

    	$scope.isLoggedIn = function (){
    		var loggedIn = false;
    		if (currentUser) {
    			loggedIn = true;
    		};

    		return loggedIn;
    	};
    	
    	function createPopUpMsg(req, comp) {
    		$scope.popMsg = "You requested " + req + " interviews. You can expect calls to come in during the remainder of this time."
    	};
    
    	

  }]);

cdApp.factory('HelloWorld', function ($q, $timeout) {
  
    var getMessages = function() {
   var deferred = $q.defer();

   $timeout(function() {
      deferred.resolve('Hello world!');
      console.log('function run');
   }, 2000);

   return deferred.promise;
 };

return {
   getMessages: getMessages
 };
  
  });

cdApp.factory('intCounterFactory', function ($timeout, $q) {
	
	var isOpenInt = false;
	var intCount;
 	var openInt;
 	var pullOpenIntReq = function (currentUser, type){
 		var deferred = $q.defer();
	 		var Amthits = Parse.Object.extend("Amthits");
			var amhitsQuery = new Parse.Query(Amthits);

			amhitsQuery.notEqualTo("status", "closed");
			amhitsQuery.equalTo("user", currentUser);
			amhitsQuery.find({
			  success: function(results) {
			  	if (results.length > 0) {
			  		openInt = results[0];
			  		if (type == "initial") {
			  		setIntCount(openInt.get('completed'));
			  		isOpenInt = true;
			  		};
			  		deferred.resolve(openInt);
			  	};
			    
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		return deferred.promise;

 	};

 	function setIntCount (num){
 		intCount = num;
 		console.log(intCount);
 	};

 	var addInterview = function (currentUser) {
 		var intId;
 		var pulltype = "not-initial";
 		pullOpenIntReq(currentUser, pulltype).then(function (intReq){
 			intId = intReq.id;
 			var Amthits = Parse.Object.extend("Amthits");
   		 	var query = new Parse.Query(Amthits);;

   		 	query.get(intId, {
			  success: function(hit) {
			    	hit.save(null, {
						success: function(user) {
							hit.increment("completed", 1);
							hit.save();
						}
					});
				intCount++;
				currentUser.save(null, {
					success: function(user) {
						currentUser.increment("balance", -1);
						currentUser.save();
						
					}
				});
			  },
			  error: function(object, error) {
			    // The object was not retrieved successfully.
			    // error is a Parse.Error with an error code and description.
			  }
			});
 		});	
 	};


 	return {
 		pullOpenIntReq: pullOpenIntReq,
 		getIntCount: function (){
 			return intCount;
 		},
 		getOpenIntCheck: function (){
 			return isOpenInt;
 		},
 		addInterview: addInterview
 	};

});



  cdApp.controller('TakeNotesCtrl', 
  	['$scope', '$location', 'shareCallSID', 'growl', '$routeParams', 'locationService',
  	function ($scope, $location, shareCallSID, growl, routeParams, locationService) {
  		console.log('in the view');
  		var currentUser = Parse.User.current();



  		$scope.newInterview = function () {
  			console.log($scope.firstName);
  			console.log('interview fired');
  			console.log($scope.selproject);
  			var Interviews = Parse.Object.extend("Interviews");
			var interviews = new Interviews();
			var name;
			var takeaway;
			console.log(locationService.getLocation());
				if (locationService.getLocation() == '/takenotes/tour') {
					console.log('in tour part');
					
					name = $('#firstName').val();
					console.log(name);
					takeaway = $('#takeaway').val();
				} else {
					console.log('in regular part');
					name = $scope.firstName;
					takeaway = $scope.takeaway;
					console.log(name);
				};

				console.log(name);
				
		  		var phone = $scope.phone;
		  		var notes = $scope.notes;
		  		var callSID = shareCallSID.getcallSID();
		  		var project = $scope.selproject;
		  		var rating = $scope.rate;
		  		
		  		console.log(callSID);

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
  			console.log('pulling the questions');
  		var Questions = Parse.Object.extend("Questions");
		var questionQuery = new Parse.Query(Questions);

//needs updating to pull the correct questions based on the selected project
			questionQuery.equalTo("project", prj);
			questionQuery.find({
			  success: function(results) {
			    $scope.selPrompt = results[0];
			    $scope.projPrompt = results;
			    console.log('these are the questions ' + results.length);
			    $scope.$apply();
			    console.log('pulled the questions');
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
		  	console.log('finding projects shared and owned');
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

	$scope.changeSelectedPrompt = function (prompt) {
		console.log(prompt);
		console.log('in question change function');
		$scope.selPrompt = prompt;
		//$scope.$apply();
		growl.addInfoMessage("Questions Changed!", {ttl: 1500});
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
		  		var duration = Math.floor(reqInterviews * 0.4 * 60);
		  		var phoneNumber = currentUser.get('number');

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
	 			 		Parse.Cloud.run('createHIT', {
				      		 "title": title,
				      		 "description": description,
				      		 "question": description + " - Please Call *67 " + phoneNumber + " and enter the code below. (Note that dialing *67 before the number keeps your phone number anonymous).",
				      		 "numHITS": reqInterviews,
				      		 "reward": 2.05,
				      		 "duration": duration
				    		}, {
				    			success: function(result) {
				    				console.log(result);
				    				notify(currentUser.get('name') + ' just requested ' + reqInterviews + ' interviews.');
				    				reloadPage();
				    		},
							    error: function(error) {
							      console.log(error);
							    }
				  			});

	 			 	
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
					    	$location.path('/waitforcall');
					     });
					}
				});
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

  		function reloadPage () {
  			$window.location.reload();
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

  		function notify (msg) {
			Parse.Cloud.run('notifyTexts', {
      		  "message": msg
    		}, {
    			success: function(result) {
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});

  			Parse.Cloud.run('slackRelay', {
      		  "message": msg
    		}, {
    			success: function(result) {
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});


		};

		// schedule modal

		$scope.showSchedule = false;

		$scope.toggleSchedule = function (){
			$scope.showSchedule = !$scope.showSchedule;
			console.log($scope.showSchedule);
		};

		$scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.availableTimes = [
      {readable:'12:00 AM EST', shade:'dark'},
      {readable:'1:00 AM EST', shade:'light'},
      {readable:'2:00 AM EST', shade:'dark'},
      {readable:'3:00 AM EST', shade:'dark'},
      {readable:'4:00 AM EST', shade:'dark'},
      {readable:'5:00 AM EST', shade:'light'},
      {readable:'6:00 AM EST', shade:'dark'},
      {readable:'7:00 AM EST', shade:'dark'},
      {readable:'8:00 AM EST', shade:'light'},
      {readable:'9:00 AM EST', shade:'dark'},
      {readable:'10:00 AM EST', shade:'dark'},
      {readable:'11:00 AM EST', shade:'dark'},
      {readable:'12:00 PM EST', shade:'light'},
      {readable:'1:00 PM EST', shade:'dark'},
      {readable:'2:00 PM EST', shade:'dark'},
      {readable:'3:00 PM EST', shade:'dark'},
      {readable:'4:00 PM EST', shade:'light'},
      {readable:'5:00 PM EST', shade:'dark'},
      {readable:'6:00 PM EST', shade:'dark'},
      {readable:'7:00 PM EST', shade:'dark'},
      {readable:'8:00 PM EST', shade:'light'},
      {readable:'9:00 PM EST', shade:'dark'},
      {readable:'10:00 PM EST', shade:'dark'},
      {readable:'11:00 PM EST', shade:'dark'}
    ];

    $scope.selectedTime;

    function processDate(myDate){
    	var readableDate = myDate.getMonth() + 1 + "/" + myDate.getDate() + "/" + myDate.getFullYear();
    	return readableDate;
    };

    $scope.sendScheduleRequest = function (){
    	var title = "10-15 minute phone interview related to " + $scope.title;
  		var phone = currentUser.get('number');
  		var name = currentUser.get('name');
  		var emailAddress = currentUser.get('email');
  		var reward = $scope.reward;
  		var description = "A 10-15 minute phone interview with anyone who " + $scope.description;
  		var reqInterviews = $scope.reqInterviews;
  		var keywords = $scope.keywords;
  		var status = "pending";
  		var confirm = $scope.confirm.code;
  		var duration = Math.floor(reqInterviews * 0.4 * 60);
  		var phoneNumber = currentUser.get('number');
  		var selectedDate = processDate($scope.dt);



  		var htmlString = "<p>Thank you for scheduling interviews with Customer Discovery Ninja.</p>"
  		+"<p>We'll send you a calendar invite shortly with all the information you'll need. Here is a summary of your request:</p>"
  		+"<ul><li>" + title + "</li>"
  		+ "<li>" + description + "</li>"
  		+"<li>Number of interviews: <strong>" + reqInterviews + "</strong></li>"
  		+"<li>Calls will start around: <strong>" 
  		+ $scope.selectedTime.readable + "</strong>, on <strong>" + selectedDate + "</strong></li>"
  		+ "</ul>"
  		+ "<p>When you're ready to take calls, go to this link below.</p>"
  		+ "<a href='http://customerdiscovery.parseapp.com/#/takenotes'>It is time, let's do it!</a>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

  		var internalHTML = "<p>" + name + " has sent a request for future interviews. Create a calendar event then invite them and other bro-founder.</p>"
  		+ "Reminder: set email & popup reminders in the cal event so both CDN Team & user remember the event"
  		+"<ul><li>Title: " + title + "</li>"
  		+ "<li>Description: " + description + "</li>"
  		+"<li>Number of interviews: <strong>" + reqInterviews + "</strong></li>"
  		+"<li>Calls will start around: <strong>" 
  		+ $scope.selectedTime.readable + "</strong>, on <strong>" + selectedDate + "</strong></li>"
  		+ "<li>Phone Number: " + phone + "</li>"
  		+ "<li>Confirmation Code: " + confirm + "</li>"
  		+ "<li>User's email address: " + emailAddress + " (remember to invite them to the event!)</li>"
  		+ "</ul>"
  		+ "<p>Shortcut below for submitting the request</p>"
  		+ "<a href='http://customerdiscovery.parseapp.com/#/projdetail/" + selectedProject + "'>Submit Interviews Here</a>"
  		+ "<p>This brings you to the user's project. They might have a template setup for the request, or you may have to create a new request with the above info.</p>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

  		// send email to user with the details
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": emailAddress,
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + ", You've Scheduled Interviews with CD Ninja!",
        	  "bodyText": "You've scheduled some interviews. We'll be in touch shortly with a calendar event.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  growl.addSuccessMessage('Check Your Email! We sent a confirmation email there.');
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});

    	// send CDN team an email
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": "info@customerdiscovery.ninja",
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + " Has Scheduled Interviews for " + selectedDate + " at " + $scope.selectedTime.readable,
        	  "bodyText": "You've scheduled some interviews. We'll be in touch shortly with a calendar event.",
        	  "bodyHTML": internalHTML

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  growl.addSuccessMessage('Request sent successfully.');
    			  $scope.goToPage('/dashboard');
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
    }; // end schedule time function

    $scope.goToPage = function(path){
		$location.path(path);
		
	};

  }]);

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


cdApp.service('shareCallSID', function() {
    var callSID = '';
    
    return {
        getcallSID: function() {
            return callSID;
        },
        setcallSID: function(value) {
            callSID = value;
        }
    }
});

cdApp.service("locationService", function ($location){

	return {
		getLocation: function() {
			return $location.path();
		}
	}
});

cdApp.service("klavioService", function(){
	return{
		postEvent: function (evName, custprop, prop){
		var currentUser = Parse.User.current();

   		var rawData = {
				"token" : "gjTY5B",
				"event" : evName,
				"customer_properties" : {
				  "$email" : currentUser.get('email')
				},
				"properties" : {}
			};
	if (custprop) {
		if (custprop.$phone_number) {
			rawData.customer_properties.$phone_number = custprop.$phone_number;
		};

		if (custprop.$first_name) {
			rawData.customer_properties.$first_name = custprop.$first_name;
		};

		if (custprop.$last_name) {
			rawData.customer_properties.$last_name = custprop.$last_name;
		};
	};
		



		var stringed = JSON.stringify(rawData);
		var encoded = window.btoa(stringed);

    	Parse.Cloud.run('sendKlaviyo', {
        	  "encdata": encoded
    		}, {
    			success: function(result) {
    			 console.log(result);
    		
    		},
			    error: function(error) {
			    	console.log(error);
			    }
  			});
		}
	}
});

   cdApp.controller('PhoneCtrl', 
   	['$scope', '$timeout', 'shareCallSID', '$interval', 'intCounterFactory', 'growl', '$location', 'locationService',
   	function ($scope, $timeout, shareCallSID, $interval, intCounterFactory, growl, $location, locationService) {

   		var currentUser = Parse.User.current();
   		$scope.userNumber = currentUser.get('number');

   		var currentLocation = locationService.getLocation();
   		console.log(currentLocation);

   		$scope.checkLoggedIn = function (){
    		var loggedIn = false;
    		if (currentUser && !(currentUser.get('number') == "") ) {
    			loggedIn = true;
    		};

    		return loggedIn;
    	};

   		function getUser() {
   			if (currentUser) {
				createConnection(currentUser.get("twilioSID"), currentUser.get("twilioAuth"), currentUser.id);
			} else {
  		  	// show the signup or login page
			};
   		};
		
		getUser();


   		var token = "";
   		function createConnection (sid, auth, userID) {
   			Parse.Cloud.run('getToken', {
      		  "actSID": sid, 
        	  "authToken": auth,
        	  "userID": userID
    		}, {
    			success: function(result) {
    			  token = result;
    			  initDevice();
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
   		};



    function initDevice (){
      Twilio.Device.setup(token);
    };

    var connection=null;
    $scope.deviceStatus = "Offline";
     
    $("#call").click(function() {  
        params = { "tocall" : $('#tocall').val()};
        connection = Twilio.Device.connect(params);
    });

  //   $scope.call = function (){
 	// 	var params = { "PhoneNumber" : $scope.dialNumber, "FromNumber": $scope.userNumber };
 	// 	connection = Twilio.Device.connect(params);
 	// 	console.log($scope.dialNumber);
 	// };

 	  $scope.call = function (){
 		var params = { "PhoneNumber" : $scope.dialNumber, "FromNumber": $scope.userNumber };
 		Twilio.Device.connect(params)
 	};

 	$scope.hangup = function () {
 		Twilio.Device.disconnectAll();
 	};

    $("#hangup").click(function() {  
        Twilio.Device.disconnectAll();
    });
 
    Twilio.Device.ready(function (device) {
        $scope.deviceStatus = "Ready to start call";
        $scope.$apply();
    });
 
    Twilio.Device.incoming(function (conn) {
        if (confirm('Accept incoming call from ' + conn.parameters.From + '?')){
            connection=conn;
            conn.accept();
          console.log(locationService.getLocation());
          if (locationService.getLocation() == '/setup') {
          	window.location.href = "#/takenotes/tour";
          } else {
          	 window.location.href = "#/takenotes";
          };
           

            shareCallSID.setcallSID(conn.parameters.CallSid);
            var theSID = shareCallSID.getcallSID();
        }
    });
 
    Twilio.Device.offline(function (device) {
        $scope.deviceStatus = "Offline";
    });
 
    Twilio.Device.error(function (error) {
        $scope.deviceStatus = "Error";
    });
 
    Twilio.Device.connect(function (conn) {
        $scope.deviceStatus = "Call Connected";
        startTimer();
        $scope.$apply();
        toggleCallStatus();
        console.log(conn);
        // if (locationService.getLocation() == "/setup") {
        // 	window.location.href="#/takenotes/tour"
        // } else {
        // 	window.location.href="#/takenotes"
        // };

    });
 
    Twilio.Device.disconnect(function (conn) {
        $scope.deviceStatus = "Call Ended";
        stopTimer();
        	if (totalseconds >= 60) {
        		intCounterFactory.addInterview(currentUser);
        		growl.addSuccessMessage("One Interview Deducted from Balance");
        	} else {
        		growl.addInfoMessage("This Interview didn't cost you!")
        	};
        //$scope.$apply();
        toggleCallStatus();
    });

     
    function toggleCallStatus(){
        //$('#call').toggle();
        //$('#hangup').toggle();
        //$('#dialpad').toggle();
    }
 
    $.each(['0','1','2','3','4','5','6','7','8','9','star','pound'], function(index, value) { 
        $('#button' + value).click(function(){ 
            if(connection) {
                if (value=='star')
                    connection.sendDigits('*')
                else if (value=='pound')
                    connection.sendDigits('#')
                else
                    connection.sendDigits(value)
                return false;
            } 
            });
    });

    var theTimer;
    function startTimer (){
    	theTimer = $interval(timerCount, 1000);
    };

    var totalseconds = 0;
    $scope.callTimer = "";
    function timerCount (){
    	totalseconds = totalseconds + 1;

    	var minutes = Math.floor(totalseconds / 60);
    	var seconds = totalseconds - (minutes * 60);

    	if (seconds < 10) {
    		$scope.callTimer = minutes + ":0" + seconds;
    	} else {
    		$scope.callTimer = minutes + ":" + seconds;
    	};
    };

   function stopTimer() {
   		$interval.cancel(theTimer);
   		$interval(resetDevice, 10000, 1);
   };

   function resetDevice () {
   	$scope.callTimer = "";
   	initDevice();
   	totalseconds = 0;

   };
    	

}]);



cdApp.controller('LoginCtrl', 
   	['$scope', '$location', '$window', '$modal', '$log', '$timeout', 'growl', 'klavioService',
   	function ($scope, $location, $window, $modal, $log, $timeout, growl, klavioService) {
   		

   		$scope.newUser = function () {
   			var user = new Parse.User();
   			var userEmail = $scope.email;
	   		var userName = $scope.name;
	   		var userPass = $scope.password;
	   		var userNumber = "";

	   		var firstName = userName.split(' ').slice(0, -1).join(' ');
			var lastName = userName.split(' ').slice(-1).join(' ');

			user.set("username", userEmail);
			user.set("password", userPass);
			user.set("email", userEmail);
			user.set("name", userName);
			user.set("number", userNumber);
			user.set("balance", 4);
			user.set("twilioSID", "AC73f7249b29a458ccfb05e1ca469023aa");
			user.set("twilioAuth", "da9c29a9a9ceda42b101242c8b5bfdb9");
		 



			user.signUp(null, {
			  success: function(user) {
			  	notify(userName + " just signed up for CDN");
			  	gotoSetup();
			  	var suEvent = "Signed Up";
			  	var cprop = {"$first_name": firstName, "$last_name": lastName};
			  	klavioService.postEvent(suEvent, cprop);
			  },
			  error: function(user, error) {
			    // Show the error message somewhere and let the user try again.
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

   		};//end new user




   		function gotoSetup (){
   			$scope.$apply( function() {
			    	$location.path('/setup');
			     	});
			    $window.location.reload();
   		};
   		
   		
   		$scope.login = function () {
   			var myemail = $scope.loginEmail;
   			var mypass = $scope.loginPass
   			Parse.User.logIn(myemail, mypass, {

				  success: function(user) {

					var loginEvent = "Logged In";
					klavioService.postEvent(loginEvent);
				    console.log('logged in buddy');
				    $timeout(function() {
				    	console.log('timeout run');
				    	$location.path('/dashboard');
				    	$scope.$apply();
				    	$window.location.reload();
				    }, 1000);
			    	
					console.log('tried to change path');
			     	
				  },
				  error: function(user, error) {
				    // The login failed. Check error to see why.
				  }
			});
   		};

   		function notify (msg) {
			Parse.Cloud.run('notifyTexts', {
      		  "message": msg
    		}, {
    			success: function(result) {
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

		$scope.forgotPass = function () {
			var email = $scope.loginEmail;
			if (email == undefined) {
				growl.addErrorMessage("Please fill out your email first");
			} else {
				// console.log('forgot pass sent to: ' + email);

				Parse.User.requestPasswordReset(email, {
				  success: function() {
				    // Password reset request was sent successfully
				    growl.addSuccessMessage("Great, check your email to reset password!");
				  },
				  error: function(error) {
				    // Show the error message somewhere
				    growl.addErrorMessage("Uh oh " + error.message);
				  }
				});
			};
			
		};


   	}]);


// SETTINGS CONTROLLER  ---------------------------------------------------------------------------------
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

   	// alpha version credits
   	// $scope.packages = [
   	// 	{"id": 0, "credits": 1, "cost": 5},
   	// 	{"id": 1, "credits": 5, "cost": 25},
   	// 	{"id": 2, "credits": 10, "cost": 45},
   	// 	{"id": 3, "credits": 100, "cost": 400}
   	// ];


   	$scope.packages = [
   		{"id": 0, "credits": 1, "cost": 10},
   		{"id": 1, "credits": 5, "cost": 45},
   		{"id": 2, "credits": 10, "cost": 80},
   		{"id": 3, "credits": 25, "cost": 175}
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

    $scope.checkSavedCustomer = function(){
    	var saved = true;
    	if (!currentUser.get('customerID')) {
    		saved = false;
    	};

    	return saved;
    };
	

	$scope.buyCredits = function(){
			var customerID = currentUser.get('customerID');
		    Parse.Cloud.run('createPayment', {
		      		  "custID": customerID,
		      		  "dollars": totalCost,
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


cdApp.controller('InterviewDetailCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$location',
   	function ($scope, $timeout, $routeParams, growl, $location) {

   		$scope.selprojectID = $routeParams.projectID;
   		$scope.oneAtATime = true;

   		var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    // At least Safari 3+: "[object HTMLElementConstructor]"
var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
var isIE = /*@cc_on!@*/false || !!document.documentMode;   // At least IE6

if (isFirefox) {
	$scope.FireFoxWarn = "Audio recorded from the mobile app will not play in Firefox, please try a different browser like Google Chrome. Sorry, we are working on fixing it.";
};




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
			    checkRecordingURL(interview);
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
 		


 		function checkRecordingURL (obj){
 			console.log(obj);
 			var interviewCallSID = obj.get('callSID');
 			console.log(interviewCallSID);
 			var Message = Parse.Object.extend("Message");
			var query = new Parse.Query(Message);

			query.equalTo("sid", interviewCallSID);
			query.find({
			  success: function(result) {
			  	console.log(result);
			 	if (result[0].get('location') == undefined) {
			    	saveNewURL(result[0], result[0].get("audioFile")._url);
			    } else {
			    	getRecording(result[0].get('sid'));
			    };
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});

 		};

 	


 		function saveNewURL (obj, url){
 			var objID = obj.id;
 			var Message = Parse.Object.extend("Message");
			var query = new Parse.Query(Message);

				query.equalTo("objectId", objID);

				query.first({
				  success: function(object) {
				     object.set("location", url);
				   	 object.save();
				   	 getRecording(object.get('sid'));
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
 		};


 		//get the recording
 		function getRecording(sid) {
 			var interviewCallSID = sid;
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
       $("audio").attr("src",$scope.recordingURL);
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

cdApp.controller('HowItWorksCtrl', 
   	['$scope', '$timeout', '$routeParams',
   	function ($scope, $timeout, $routeParams) {

 			
   	}]);

cdApp.controller('SetupCtrl', 
   	['$scope', '$timeout', '$routeParams', '$modal', '$log', '$window', '$location', 'growl', 'klavioService',
   	function ($scope, $timeout, $routeParams, $modal, $log, $window, $location, growl, klavioService) {
   		var currentUser = Parse.User.current();
   		$scope.user = currentUser;

   		$scope.projectTitle;
   		$scope.projectDescription;
   		$scope.userPhoneNumber;
   		$scope.targetDescription;
   		$scope.targetTitle;
   		$scope.questions = "<p><ul><li>What's your biggest problem around <strong>[topic of problem you are solving]</strong>?</li><li>Why is that a problem?</li><li>What are you currently doing to solve that problem?</li><li>What do you like or dislike about that solution?</li></ul><br><br>Remember: Don't pitch your solution, have a conversation about their problems!</p>"
   		$scope.initialProject;
   		$scope.setupStep = 1;


   		$scope.addStep = function(){
   			console.log('added step');
   			$scope.setupStep = $scope.setupStep + 1
   		};

   		$scope.subStep = function(){
   			$scope.setupStep = $scope.setupStep - 1;
   		};

   		$scope.setStep = function(step){
   			$scope.setupStep = step;
   		};

   		$scope.submitProject = function (){
   			saveProject();
   			console.log('submitted project');
   			$scope.addStep();
   		};

   		$scope.saveItAll = function () {
   			$location.path('/projdetail/' + $scope.initialProject.id);
   		};

   		$scope.sendRequest = function (){
   			//make it ring with 1 interview
   		};

   		$scope.saveTemplate = function (){
   			saveTemplate();
   			$scope.addStep();
   		};

   		$scope.saveQuests = function (){
   			saveQuestions();
   			$scope.addStep();
   		};



   		$scope.couponHelperMsg = ""
   		$scope.findCoupon = function(){
   			if ($scope.givenCode == "") {
   				$scope.couponHelperMsg = "";
   			} else {
   				Parse.Cloud.run('getCoupon', {
   				"givenCode": $scope.givenCode
   			}, {
   				success: function (result){
   					if (result.amount_off == 2000 && result.duration == "once") {
   						$scope.couponHelperMsg = "First Month Free! No charges today!"
   						$scope.$apply();
   					};
   				},
   				error: function (error) {
   					$scope.couponHelperMsg = "Sorry, we couldn't find that coupon."
   					console.log(error);
   					$scope.$apply();
   				}
   			});
   			};
   			
   		};

   		


   		$scope.handleStripe = function(status, response){
        if(response.error) {
          growl.addErrorMessage('It did not work. try again')
        } else {
          // got stripe token, now charge it or smt
          
          var token = response.id;
          var name = currentUser.get('name');
          var email = currentUser.get('email');
          var couponCode = $scope.givenCode;

          Parse.Cloud.run('createCustomer', {
		      		 "card": token,
		      		 "email": email,
		      		 "coupon": couponCode,
		      		 "description": name,
		      		 "plan": "monthly20"
		    		}, {
		    			success: function(result) {
		    			 console.log(result);
		    			 updateUser(result);
		    			 var e = "Credit Card Added";
		    			 klavioService.postEvent(e)
		    		},
					    error: function(error) {
					   	  growl.addErrorMessage('Sorry there was a problem, try again');
					      console.log(error);
					    }
		  			});
		        }
		    };

   		function createCustomer (name, email, token){
   			Parse.Cloud.run('createCustomer', {
      		 "name": name,
      		 "card": token,
      		 "email": email
    		}, {
    			success: function(result) {
    				console.log(result);
    				updateUser(result);
    				gotoSetup();
    				//subscribe the customer

    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
   		};

   		function subscribeCustomer (){
   			//subscribe the customer 
   		};

   		function updateUser(result) {
   			currentUser.save(null, {
				success: function(user) {
					currentUser.set("customerID", result.id);
					currentUser.save();
					$scope.addStep();
					$scope.$apply();
					$scope.getPhoneNumbers();
				}
			});
   		};


   		$scope.getPhoneNumbers = function () {
    	console.log('got to the function');
    	var areaCodeInput = $scope.areaCode;
    	if (!areaCodeInput || areaCodeInput == "") {
    		areaCodeInput = "734";
    	};

    	Parse.Cloud.run('getAvailNumbers', {
      		 "areaCode": areaCodeInput
    		}, {
    			success: function(result) {
					$scope.availNumbers = result;
					$scope.$apply();
					$scope.purchaseNumber(result[0].phone_number, result[0].friendly_name);
    		},
			    error: function(error) {
			     
			    }
  			});

    };
    
    $scope.purchaseNumber = function (phone, friendly) {
    	var phoneNumber = phone;
    	var email = currentUser.get('email');
    	var userID = currentUser.id;
    	console.log(phoneNumber + " " + email + " " + " " + userID);
    	$scope.userPhoneNumber = friendly;

    	$scope.$apply();
    	

    	currentUser.save(null, {
			success: function(user) {
				currentUser.set("number", friendly);
				setPhone(friendly);
				currentUser.save();
			}
		});

    	Parse.Cloud.run('purchaseNumber', {
      		 "email": email,
      		 "userID": userID,
      		 "phone": phoneNumber
    		}, {
    			success: function(result) {
    				console.log('you bought the number');
    				console.log(result);
    				sendConfirmEmail(phoneNumber, email);
    		},
			    error: function(error) {
			     	sendConfirmEmail(phoneNumber, email);
			    }
  			});
		//$scope.addStep();

    };


    function sendConfirmEmail(num, em) {
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": em,
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": "Welcome to CD Ninja!",
        	  "bodyText": "You've signed up successfully, your phone number is " + num + ". Feel free to give that out to people and have them call you. You only pay for interviews that you schedule through us, if you give your number to someone to call you, that one is free!",
        	  "bodyHTML": "<p>Hi there!" 
        	  + "Thanks for signing up for Customer Discovery Ninja. We're glad to have you as part of our community."
        	  +"<br>Let's get a few things out of the way to help you get started."
        	  +"<ul>"
        	  	+"<li>" + "Your dedicated in browser phone number is <strong>" + num + "</strong></li>"
        	  	+"<li>" + "Feel free to give that number out to anyone who you want to interview" + "</li>"
        	  	+"<li>" + "You only pay for interviews that you request through us, so if you give that number out the interview is free!" + "</li>"
        	  	+"<li>" + "You can request on-demand interviews here: <a href='http://customerdiscovery.parseapp.com/#/request/interviews'>Request interviews</a>" + "</li>"
        	  	+"<li>To buy more interview credits, go to your settings here <a href='http://customerdiscovery.parseapp.com/#/settings'>Buy more credits</a>"
        	  +"</ul>"
        	  +"If you have any other questions, feel free to let us know!"
        	  + "</p>"

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

    		var selectedPhoneNumber;
			function setPhone(num){
				selectedPhoneNumber = num;
				var e = "Phone Number Purchased";
				var cprop = {"$phone_number": num};
		    	klavioService.postEvent(e,cprop);
			};


    	function saveProject() {

   			var Projects = Parse.Object.extend("Projects");
  			var project = new Projects();

  			var title = $scope.projectTitle;
  			var description = $scope.projectDescription;
  			var sharedUsersList = [];

  				project.set("title", title);
				project.set("description", description);
				project.set("user", currentUser);
				project.set("sharedUsers", sharedUsersList)
				 
				project.save(null, {
				  success: function(proj) {
				  	$scope.initialProject = proj;
				    checkDefaultProj(proj);
				    saveQuestions();
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

   			function setProject (projID){
   				console.log(projID);
   				var Projects = Parse.Object.extend("Projects");
				var query = new Parse.Query(Projects);
				query.equalTo("id", projID);
				query.find({
				  success: function(results) {
				    console.log(results);
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
   			};

   			function saveTemplate (){

	   			var IntTemplate = Parse.Object.extend("IntTemplate");
				var inttemplate = new IntTemplate();

				//if requesting to make a new template, post a new template
				var title = $scope.targetTitle;
		  		var description = $scope.targetDescription;
		  		var reqInterviews = "1";
		  		var confirm = "";
		  		var relatedProject = $scope.initialProject;
			 
				inttemplate.set("title", title);
				inttemplate.set("description", description);
				inttemplate.set("confirm", confirm);
				inttemplate.set("reqInterviews", reqInterviews);
				inttemplate.set("project", relatedProject);
				 
				inttemplate.save(null, {
				  success: function(inttemplate) {
				    // Execute any logic that should take place after the object is saved.
				    console.log('in the success block');
				    setTemplate();
				  },
				  error: function(inttemplate, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and message.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});
			};

			var templateTitle;
			var templateDescription;
			function setTemplate(){
				templateTitle = $scope.targetTitle;
				templateDescription = $scope.targetDescription;
			};



			function saveQuestions() {
				console.log('in the save questions');
				var Questions = Parse.Object.extend("Questions");
				var questions = new Questions();

				var qTitle = "First Questions";
				var quest = $scope.questions;

				questions.set("title", qTitle);
				questions.set("questions", quest);
				questions.set("user", currentUser);
				questions.set("project", $scope.initialProject);
				 
				questions.save(null, {
				  success: function(question) {
				  	console.log(question);
				  },
				  error: function(question, error) {
				    // Execute any logic that should take place if the save fails.
				    // error is a Parse.Error with an error code and description.
				    alert('Failed to create new object, with error code: ' + error.message);
				  }
				});

			};



			$scope.open = function (size) {

		    var modalInstance = $modal.open({
		      templateUrl: 'submitInterviews.html',
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

		 	$scope.setFormReference = function(intReqForm) { 
		 		$scope.intReqForm = intReqForm;
		 		$scope.intReqForm.confirm;
		 	};

		 	function pullIntInfo (){
		 			var IntTemplate = Parse.Object.extend("IntTemplate");
					var tempQuery = new Parse.Query(IntTemplate);

					tempQuery.equalTo("project", proj);
					tempQuery.descending("updatedAt");
					tempQuery.limit(1);
					tempQuery.find({
					  success: function(results) {
					  	console.log(results);
					  },
					  error: function(error) {
					    alert("Error: " + error.code + " " + error.message);
					  }
					});

		 	};
		 

		 	$scope.requestHIT = function () {
		 		var phoneNumber = currentUser.get('number');
	   			var Amthits = Parse.Object.extend("Amthits");
				var amhits = new Amthits();

				var title = "10-15 minute phone interview related to " + templateTitle;
		  		var phone = selectedPhoneNumber;
		  		var description = "A 10-15 minute phone interview with anyone who " + templateDescription;
		  		var reqInterviews = "1";
		  		var status = "pending";
		  		var confirm = $scope.intReqForm.confirm;
		  		var duration = Math.floor(reqInterviews * 0.4 * 60 + 20);

			amhits.set("title", title);
			amhits.set("phone", phone);
		    amhits.set("reqInterviews", reqInterviews);
			amhits.set("description", description);
			amhits.set("status", status);
			amhits.set("confirm", confirm);
			amhits.set("user", currentUser);
			amhits.set("duration", duration);
			amhits.set("completed", 0);

				amhits.save(null, {
	 			 success: function(amhit) {
	 			 		Parse.Cloud.run('createHIT', {
				      		 "title": title,
				      		 "description": description,
				      		 "question": description + " - Please Call *67 " + phone + " and enter the code below. (Note that dialing *67 before the number keeps your phone number anonymous).",
				      		 "numHITS": reqInterviews,
				      		 "reward": 2.05,
				      		 "duration": duration
				    		}, {
				    			success: function(result) {
				    				console.log(result);
				    				reloadPage();
				    		},
							    error: function(error) {
							      console.log(error);
							    }
				  			});
	 			}
	 		});

   		};//end new user

   		function reloadPage(){
   			$scope.$apply( function() {
	    	$location.path('/dashboard');
	     	});
   			 $window.location.reload();
   		};
		 	
			  $scope.cancel = function () {
			    $modalInstance.dismiss('cancel');
			  };
   		};
		

		  function pullSegments(){
			var Segment = Parse.Object.extend("Segment");
			var query = new Parse.Query(Segment);
			query.find({
			  success: function(results) {
			   $scope.collection = results;
			   $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};

		pullSegments();

  $scope.selectedIndex = -1; // Whatever the default selected index is, use -1 for no selection
  $scope.selectedSegment;
  $scope.showSubmitNew = false;
  $scope.showSubmittedNew = false;

  $scope.itemClicked = function ($index) {
    $scope.selectedIndex = $index;
    $scope.selectedSegment = $scope.collection[$index];
    $scope.showSubmitNew = false;
  };
  $scope.showNewTargetDescription = function (){
  	$scope.itemClicked(-1);
  	$scope.showSubmitNew = true;
  };

  $scope.submitNewSegmentRequest = function(){
		  		var name = currentUser.get('name');
		  		var emailAddress = currentUser.get('email');
		  		var description = $scope.newSpecific;
		  		var newTitle = $scope.newGeneral;



  		var htmlString = "<p>Thank you for requesting a new segment with Customer Discovery Ninja.</p>"
  		+"<p>In order to provide the best possible service to our customers, we carefully and personally setup each new segment in our system.</p>"
  		+ "<p>We'll review your request and be in touch shortly. Here is a quick summary of your request:</p>"
  		+"<ul><li>You want to talk to: " + newTitle + "</li>"
  		+"<li><strong>Description: </strong>" + description + "</li>"
  		+ "</ul>"
  		+ "<p>'No reply' emails are useless, feel free to reply to this one!</p>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

			// send email to user with confirmation
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": emailAddress,
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + ", Thanks for requesting a new segment with CD Ninja!",
        	  "bodyText": "You've requested a new segment. We'll be in touch shortly.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  
    			  notifyCDNTeam(name, emailAddress, newTitle, description);
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

		function notifyCDNTeam (name, email, title, desc) {
			var htmlString = "<p>" + name + " requested a new segment be created.</p>"
  		+"<p>Here is a quick summary of their request:</p>"
  		+"<ul><li>They want to talk to: " + title + "</li>"
  		+"<li><strong>Description: </strong>" + desc + "</li>"
  		+ "</ul>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

			// send email to user with confirmation
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": "info@customerdiscovery.ninja",
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + " requested a new segment with CD Ninja!",
        	  "bodyText": "Requested a new segment. We'll be in touch shortly.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  $scope.showSubmitNew = false;
    			  $scope.showSubmittedNew = true;
    			  $scope.addStep();
    			  growl.addSuccessMessage('Check Your Email! We sent a confirmation email there.');
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

				
 			
   	}]);

cdApp.controller('HomeCtrl', 
   	['$scope', '$timeout', '$routeParams', '$modal', '$log', '$window', '$location', 'locationService',
   	function ($scope, $timeout, $routeParams, $modal, $log, $window, $location, locationService) {

   		$scope.goToPage = function(path){
		$location.path(path);
		
	};

	$scope.goToExternal = function(url){
		$window.location.href= url;
	};

	$scope.fromMILVALCHAL = function (){
		var MVC = false;
		if (locationService.getLocation() == '/milvalchal') {
			MVC = true;
		};

		return MVC;
	};

		$scope.open = function (size) {

		    var modalInstance = $modal.open({
		      templateUrl: 'untorch.html',
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

		 	$scope.setFormReference = function(newUserForm) { 
		 		$scope.newUserForm = newUserForm;
		 		$scope.newUserForm.name;
		 		$scope.newUserForm.email;
		 		$scope.newUserForm.password1;
		 		$scope.newUserForm.password2;
		 	};

		 	$scope.newUser = function () {
	   			var user = new Parse.User();
	   			var userEmail = $scope.newUserForm.email;
		   		var userName = $scope.newUserForm.name;
		   		var userPass = $scope.newUserForm.password;
		   		var userNumber = "";

				user.set("username", userEmail);
				user.set("password", userPass);
				user.set("email", userEmail);
				user.set("name", userName);
				user.set("number", userNumber);
				user.set("balance", 1)
				user.set("twilioSID", "AC73f7249b29a458ccfb05e1ca469023aa");
				user.set("twilioAuth", "da9c29a9a9ceda42b101242c8b5bfdb9");
			 
				user.signUp(null, {
				  success: function(user) {
				    $scope.$apply( function() {
				    	$location.path('/setup');
				     	});
				    $window.location.reload();
				  },
				  error: function(user, error) {
				    // Show the error message somewhere and let the user try again.
				    alert("Error: " + error.code + " " + error.message);
				  }
				});

   		};//end new user
		 	
			  $scope.cancel = function () {
			    $modalInstance.dismiss('cancel');
			  };
		};   		

   	}]);

cdApp.controller('PricingCtrl', 
   	['$scope', '$timeout', '$routeParams',
   	function ($scope, $timeout, $routeParams) {
   		
   
   	}]);

cdApp.controller('AboutUsCtrl', 
   	['$scope', '$timeout', '$routeParams',
   	function ($scope, $timeout, $routeParams) {
   	
 			
   	}]);




cdApp.controller('TestpageCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl', '$modal', '$log', '$http', 'klavioService', 
   	function ($scope, $timeout, $routeParams, growl, $modal, $log, $http, klavioService) {
   		var currentUser = Parse.User.current();
   	
   		$scope.testFunction = function (evName, custprop, prop){
		var currentUser = Parse.User.current();



   		var rawData = {
				"token" : "gjTY5B",
				"event" : evName,
				"customer_properties" : {
				  "$email" : currentUser.get('email')
				},
				"properties" : {}
			};

		console.log(custprop.$phone_number);
		console.log(custprop);

		if (custprop.$phone_number) {
			rawData.customer_properties.$phone_number = custprop.$phone_number;
		};


		console.log(rawData);
	
		};

		var eventName = "My Event";
		var c_properties = {
			"$phone_number": "123456789",
			"$first_name": "Bob",
			"$last_name": "Dylan"
		};


		$scope.testFunction(eventName, c_properties);

   	}]);



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


cdApp.controller('CDNDashCtrl', 
   	['$scope', '$timeout', '$routeParams',
   	function ($scope, $timeout, $routeParams) {
   		

   		$scope.theDuration;
   		$scope.interviews;



   		var Interviews = Parse.Object.extend("Interviews");
		var query = new Parse.Query(Interviews);
		query.find({
		  success: function(ints) {
		    $scope.interviews = ints.length;
		  },
		  error: function(object, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		  }
		});
		
		function getRecordings (){
			var thou;
			var hund;
			var extraZero;
			console.log('trying to get the recording minutes');
			Parse.Cloud.run('getTotalRecordings', {
      		 "type": "total"
    		}, {
    			success: function(result) {
    					var total = 0;
						$.each(result, function () {
						    total += (this / 60);
						});
    				if (total >= 1000) {
    					thou = Math.floor(total/1000);
    					hund = Math.floor(total - (thou*1000));
    					if (hund <100) {
    						extraZero = 0;
    					} else {
    						extraZero ="";
    					};
    				$scope.theDuration = thou + "," + extraZero + hund;
    				$scope.$apply();
    				} else {
    				$scope.theDuration = Math.floor(total);
    				$scope.$apply();
    				};

    				
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};
		
		getRecordings();
 			
   	}]);


cdApp.controller('WaitForCallCtrl', 
   	['$scope', '$timeout', '$routeParams',
   	function ($scope, $timeout, $routeParams) {
   		var currentUser = Parse.User.current();
   		
   		$scope.userPhone = currentUser.get('number');

 			
   	}]);

cdApp.controller('RequestCtrl', 
   	['$scope', '$timeout', '$routeParams', 'intCounterFactory', '$location', '$window', 'growl', 'klavioService',
   	function ($scope, $timeout, $routeParams, intCounterFactory, $location, $window, growl, klavioService) {
   		var currentUser = Parse.User.current();
   		$scope.currentUserEmail = currentUser.get('email');
   		$scope.currentUserPhone = currentUser.get('number');
   		$scope.usersBalance = currentUser.get('balance');
   		

   $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
   $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.checkForInt = function(){
  	return intCounterFactory.getOpenIntCheck();
  };

  $scope.displayText = "does this show up?";


$scope.durationOptions = [
      {readable:'30 Minutes', expect:'One Interview', duration: 30, interviews: 2},
      {readable:'1 Hour', expect:'Two Interviews', duration: 60, interviews: 3},
      {readable:'1.5 Hours', expect:'Three Interviews', duration: 90, interviews: 4},
      {readable:'2 Hours', expect:'Four Interviews', duration: 120, interviews: 5}
    ];

  $scope.availableTimes = [
      {readable:'12:00 AM EST', shade:'dark', hour: 0},
      {readable:'1:00 AM EST', shade:'light', hour: 1},
      {readable:'2:00 AM EST', shade:'dark', hour: 2},
      {readable:'3:00 AM EST', shade:'dark', hour: 3},
      {readable:'4:00 AM EST', shade:'dark', hour: 4},
      {readable:'5:00 AM EST', shade:'light', hour: 5},
      {readable:'6:00 AM EST', shade:'dark', hour: 6},
      {readable:'7:00 AM EST', shade:'dark', hour: 7},
      {readable:'8:00 AM EST', shade:'light', hour: 8},
      {readable:'9:00 AM EST', shade:'dark', hour: 9},
      {readable:'10:00 AM EST', shade:'dark', hour: 10},
      {readable:'11:00 AM EST', shade:'dark', hour: 11},
      {readable:'12:00 PM EST', shade:'light', hour: 12},
      {readable:'1:00 PM EST', shade:'dark', hour: 13},
      {readable:'2:00 PM EST', shade:'dark', hour: 14},
      {readable:'3:00 PM EST', shade:'dark', hour: 15},
      {readable:'4:00 PM EST', shade:'light', hour: 16},
      {readable:'5:00 PM EST', shade:'dark', hour: 17},
      {readable:'6:00 PM EST', shade:'dark', hour: 18},
      {readable:'7:00 PM EST', shade:'dark', hour: 19},
      {readable:'8:00 PM EST', shade:'light', hour: 20},
      {readable:'9:00 PM EST', shade:'dark', hour: 21},
      {readable:'10:00 PM EST', shade:'dark', hour: 22},
      {readable:'11:00 PM EST', shade:'dark', hour: 23}
    ];

    function pullSegments(){
			var Segment = Parse.Object.extend("Segment");
			var query = new Parse.Query(Segment);
			query.find({
			  success: function(results) {
			   $scope.collection = results;
			   $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};

		pullSegments();

  $scope.selectedIndex = -1; // Whatever the default selected index is, use -1 for no selection
  $scope.selectedSegment;
  $scope.showSubmitNew = false;
  $scope.showSubmittedNew = false;

  $scope.itemClicked = function ($index) {
    $scope.selectedIndex = $index;
    $scope.selectedSegment = $scope.collection[$index];
    $scope.showSubmitNew = false;
  };
  $scope.showNewTargetDescription = function (){
  	$scope.itemClicked(-1);
  	$scope.showSubmitNew = true;
  };

    $scope.selectedTime;

    function processDate(myDate){
    	var readableDate = myDate.getMonth() + 1 + "/" + myDate.getDate() + "/" + myDate.getFullYear();
    	return readableDate;
    };

    $scope.sendScheduleRequest = function (){
  		var phone = currentUser.get('number');
  		var name = currentUser.get('name');
  		var emailAddress = currentUser.get('email');
  		var duration = $scope.selectedFutureDuration.readable;
  		var phoneNumber = currentUser.get('number');
  		var selectedDate = processDate($scope.dt);
  		var segmentID = $scope.selectedSegment.id;
  		var segmentTitle = $scope.selectedSegment.get('customerTitle');
  		var segmentDescription = $scope.selectedSegment.get('customerDescription');
  		var selectedProject = $routeParams.projID;



  		var htmlString = "<p>Thank you for scheduling interviews with Customer Discovery Ninja.</p>"
  		+"<p>We'll send you a calendar invite shortly with all the information you'll need. Here is a summary of your request:</p>"
  		+"<ul><li>Customer Segment: " + segmentTitle + "</li>"
  		+"<li>Duration: <strong>" + duration + "</strong></li>"
  		+"<li>Calls will start around: <strong>" 
  		+ $scope.selectedTime.readable + "</strong>, on <strong>" + selectedDate + "</strong></li>"
  		+ "</ul>"
  		+ "<p>When you're ready to take calls, go to this link below.</p>"
  		+ "<a href='http://customerdiscovery.parseapp.com/#/takenotes'>It is time, let's do it!</a>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

  		var internalHTML = "<p>" + name + " has sent a request for future interviews. Create a calendar event then invite them and other bro-founder.</p>"
  		+ "Reminder: set email & popup reminders in the cal event so both CDN Team & user remember the event"
  		+"<ul><li>Segment Title: " + segmentTitle + "</li>"
  		+ "<li>Segment ID: " + segmentID + "</li>"
  		+"<li>Duration: <strong>" + duration + "</strong></li>"
  		+"<li>Calls will start around: <strong>" 
  		+ $scope.selectedTime.readable + "</strong>, on <strong>" + selectedDate + "</strong></li>"
  		+ "<li>Phone Number: " + phone + "</li>"
  		+ "<li>User's email address: " + emailAddress + " (remember to invite them to the event!)</li>"
  		+ "</ul>"
  		+ "<p>Shortcut below for submitting the request</p>"
  		+ "<a href='http://customerdiscovery.parseapp.com/#/projdetail/" + selectedProject + "'>Submit Interviews Here</a>"
  		+ "<p>This brings you to the user's project. They might have a template setup for the request, or you may have to create a new request with the above info.</p>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";


  		// post event

  		var requestEvent = "Scheduled Future Interviews";
  		klavioService.postEvent(requestEvent);



  		// send email to user with the details
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": emailAddress,
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + ", You've Scheduled Interviews with CD Ninja!",
        	  "bodyText": "You've scheduled some interviews. We'll be in touch shortly with a calendar event.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  growl.addSuccessMessage('Check Your Email! We sent a confirmation email there.');
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});

    	// send CDN team an email
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": "info@customerdiscovery.ninja",
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + " Has Scheduled Interviews for " + selectedDate + " at " + $scope.selectedTime.readable,
        	  "bodyText": "You've scheduled some interviews. We'll be in touch shortly with a calendar event.",
        	  "bodyHTML": internalHTML

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  growl.addSuccessMessage('Request sent successfully.');
    			  $scope.goToPage('/dashboard');
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});

    	postScheduled();

    }; // end schedule time function


    function postScheduled (){
    		//create a new 

    	var Scheduled = Parse.Object.extend("Scheduled");
		var scheduled = new Scheduled();

		var date = $scope.dt;
		var dateYear = date.getFullYear();
		var dateMonth = date.getMonth();
		var dateDay = date.getDate();

		var d = new Date(dateYear, dateMonth, dateDay, $scope.selectedTime.hour, 0, 0, 0);

		var theDuration = $scope.selectedFutureDuration.duration;
		var reqInts = $scope.selectedFutureDuration.interviews;



		scheduled.set("user", currentUser);
		scheduled.set("segmentID", $scope.selectedSegment.id);
		scheduled.set("dateTime", d);
		scheduled.set("duration", theDuration);
		scheduled.set("interviews", reqInts);
		scheduled.set("phone", currentUser.get('number'));
		scheduled.set("MTurkTitle", $scope.selectedSegment.get('MTTitle'));
		scheduled.set("MTurkQuestion", $scope.selectedSegment.get('MTQuestion'));
		scheduled.set("MTurkDescription", $scope.selectedSegment.get('MTDescription'));
		scheduled.set("MTurkReward", $scope.selectedSegment.get('MTReward'));

		//title, question, description, reward
		 
		scheduled.save(null, {
		  success: function(scheduled) {
		    // Execute any logic that should take place after the object is saved.
		    
		  },
		  error: function(scheduled, error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and message.
		    
		  }
		});
    };


    $scope.goToPage = function(path){
		$location.path(path);
		
	};
		$scope.whenModel = false; // start off as disabled
	$scope.checkready = function(){
		var notready = true;

			if ($scope.whenModel == 'Now') {
				if ($scope.selectedDuration !== undefined && $scope.selectedSegment !== undefined) {
					notready = false;
				} else {
					notready = true;
				}
			} if ($scope.whenModel == 'Later') {
				if ($scope.selectedFutureDuration !== undefined && $scope.dt !== undefined && $scope.selectedSegment !== undefined) {
					notready = false;
				};

			};

		return notready;
	};


	$scope.sendRequest = function(){
		if ($scope.whenModel == 'Now') {
			$scope.newHIT();
		} if ($scope.whenModel == 'Later') {
			$scope.sendScheduleRequest();
		};
		
	};


   		function makeid (digits){
		    var text = "";
		    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		    for( var i=0; i < digits; i++ )
		        text += possible.charAt(Math.floor(Math.random() * possible.length));

		    return text;
		};

	$scope.newHIT = function () {
  			var Amthits = Parse.Object.extend("Amthits");
			var amhits = new Amthits();

				var title = $scope.selectedSegment.get('MTTitle');
		  		var phone = currentUser.get('number');
		  		var reward = $scope.selectedSegment.get('MTReward');
				var rewardParse = $scope.selectedSegment.get('MTReward').toString();
		  		var description = $scope.selectedSegment.get('MTDescription');
		  		var reqInterviews = $scope.selectedDuration.interviews.toString();
		  		var keywords = "phone, easy, fun, quick";
		  		var status = "pending";
		  		var duration = $scope.selectedDuration.duration;
		  		var phoneNumber = currentUser.get('number');
		  		var question = $scope.selectedSegment.get('MTQuestion');


			amhits.set("title", title);
			amhits.set("phone", phone);
		    amhits.set("reward", rewardParse);
		    amhits.set("reqInterviews", reqInterviews);
			amhits.set("description", description);
			amhits.set("status", status);
			amhits.set("user", currentUser);
			amhits.set("duration", duration);
			amhits.set("completed", 0);

			var rand1 = makeid(20);
			var rand2 = makeid(20);

			var customURL = "http://customerdiscovery.parseapp.com/#/mturkvalidation/" + rand1 + "/" + rand2;

			if (reqInterviews -1 <= $scope.usersBalance) {
				amhits.save(null, {
	 			 success: function(amhit) {
	 			 		Parse.Cloud.run('createHIT', {
				      		 "title": title,
				      		 "description": description,
				      		 "question": question + ", please Call *67 " + phoneNumber + " (Note that dialing *67 before the number keeps your phone number anonymous). After the call, go to this link to retrieve your response for this HIT (just so we can validate that you did the HIT). " + customURL,
				      		 "numHITS": reqInterviews,
				      		 "reward": reward,
				      		 "duration": duration
				    		}, {
				    			success: function(result) {
				    				console.log(result);
				    				var e = "Requested Interviews";
  									klavioService.postEvent(e);
				    				notify(currentUser.get('name') + ' just requested ' + reqInterviews + ' interviews.');
				    				reloadPage();
				    		},
							    error: function(error) {
							      console.log(error);
							    }
				  			});

	 			 	
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
					    	$location.path('/waitforcall');
					     });
					}
				});
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

  		function reloadPage () {
  			$window.location.reload();
  		};

  		function notify (msg) {
			Parse.Cloud.run('notifyTexts', {
      		  "message": msg
    		}, {
    			success: function(result) {
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});

  			Parse.Cloud.run('slackRelay', {
      		  "message": msg
    		}, {
    			success: function(result) {
    			console.log('tried to run the slack request function');
    			 console.log(result);
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

		$scope.submitNewSegmentRequest = function(){
		  		var name = currentUser.get('name');
		  		var emailAddress = currentUser.get('email');
		  		var description = $scope.newSpecific;
		  		var newTitle = $scope.newGeneral;



  		var htmlString = "<p>Thank you for requesting a new segment with Customer Discovery Ninja.</p>"
  		+"<p>In order to provide the best possible service to our customers, we carefully and personally setup each new segment in our system.</p>"
  		+ "<p>We'll review your request and be in touch shortly. Here is a quick summary of your request:</p>"
  		+"<ul><li>You want to talk to: " + newTitle + "</li>"
  		+"<li><strong>Description: </strong>" + description + "</li>"
  		+ "</ul>"
  		+ "<p>'No reply' emails are useless, feel free to reply to this one!</p>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

			// send email to user with confirmation
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": emailAddress,
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + ", Thanks for requesting a new segment with CD Ninja!",
        	  "bodyText": "You've requested a new segment. We'll be in touch shortly.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  growl.addSuccessMessage('Check Your Email! We sent a confirmation email there.');
    			  notifyCDNTeam(name, emailAddress, newTitle, description);
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};

		function notifyCDNTeam (name, email, title, desc) {
			var htmlString = "<p>" + name + " requested a new segment be created.</p>"
  		+"<p>Here is a quick summary of their request:</p>"
  		+"<ul><li>They want to talk to: " + title + "</li>"
  		+"<li><strong>Description: </strong>" + desc + "</li>"
  		+ "</ul>"
  		+ "<p>Thank You,</p>"
  		+ "<p>Customer Discovery Ninja Team</p>";

			// send email to user with confirmation
    	Parse.Cloud.run('sendEmail', {
        	  "recipient": "info@customerdiscovery.ninja",
        	  "sender": "info@customerdiscovery.ninja",
        	  "subject": name + " requested a new segment with CD Ninja!",
        	  "bodyText": "Requested a new segment. We'll be in touch shortly.",
        	  "bodyHTML": htmlString

    		}, {
    			success: function(result) {
    			  console.log(result);
    			  $scope.showSubmitNew = false;
    			  $scope.showSubmittedNew = true;
    		
    		},
			    error: function(error) {
			      console.log(error);
			    }
  			});
		};




 			
   	}]);



cdApp.controller('SegmentsCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl',
   	function ($scope, $timeout, $routeParams, growl) {
   		var currentUser = Parse.User.current();
   		


   	$scope.newSegment = function(){
   		var Segment = Parse.Object.extend("Segment");
		var segment = new Segment();

		var customerTitle = $scope.customerTitle;
		var customerDescription = $scope.customerDescription;
		var MTTitle = $scope.MTTitle;
		var MTDescription= $scope.MTDescription;
		var MTQuestion = $scope.MTQuestion;
		var MTReward = parseFloat($scope.MTReward);

		 
		segment.set("customerTitle", customerTitle);
		segment.set("customerDescription", customerDescription);
		segment.set("MTTitle", MTTitle);
		segment.set("MTDescription", MTDescription);
		segment.set("MTQuestion", MTQuestion);
		segment.set("MTReward", MTReward);

		 
		segment.save(null, {
		  success: function(segment) {
		  	pullSegments();
		    // Execute any logic that should take place after the object is saved.
		    growl.addSuccessMessage('Created New Segment!');
		    
		  },
		  error: function(segment, error) {
		    // Execute any logic that should take place if the save fails.
		    // error is a Parse.Error with an error code and message.
		    alert('Failed to create new object, with error code: ' + error.message);
		  }
		});
   	};

   		

		$scope.segmentList;
		function pullSegments(){
			var Segment = Parse.Object.extend("Segment");
			var query = new Parse.Query(Segment);
			query.find({
			  success: function(results) {
			   $scope.segmentList = results;
			   $scope.$apply();
			  },
			  error: function(error) {
			    alert("Error: " + error.code + " " + error.message);
			  }
			});
		};

		pullSegments();


		// handle clicking in the list
		var selectedID;
		$scope.itemClicked = function ($index) {
		    $scope.selectedIndex = $index;
		    $scope.selectedSegment = $scope.segmentList[$index];
		    $scope.customerTitle = $scope.selectedSegment.get('customerTitle');
		    $scope.customerDescription = $scope.selectedSegment.get('customerDescription');
		    $scope.MTTitle = $scope.selectedSegment.get('MTTitle');
		    $scope.MTDescription = $scope.selectedSegment.get('MTDescription');
		    $scope.MTQuestion = $scope.selectedSegment.get('MTQuestion');
		    $scope.MTReward = $scope.selectedSegment.get('MTReward');
		    selectedID = $scope.selectedSegment.id;
		  };

		$scope.saveSegment = function (){
			console.log(selectedID);
				var newNotes = $scope.notes;
 				var newName = $scope.name;
 				var newRating = $scope.rate;
 				var newTakeaway = $scope.takeaway;
	 			var Segment = Parse.Object.extend("Segment");
				var query = new Parse.Query(Segment);

				query.equalTo("objectId", selectedID);

				query.first({
				  success: function(object) {
				     object.set("customerTitle", $scope.customerTitle);
				     object.set("customerDescription", $scope.customerDescription);
				     object.set("MTTitle", $scope.MTTitle);
				     object.set("MTDescription", $scope.MTDescription );
					 object.set("MTQuestion", $scope.MTQuestion);
				     object.set("MTReward", parseFloat($scope.MTReward));
				   	 object.save();
				   	 growl.addSuccessMessage("success", "Segment Saved!");
				   	 pullSegments();
				  },
				  error: function(error) {
				    alert("Error: " + error.code + " " + error.message);
				  }
				});
 	}; //end update notes
		
 			
   	}]);

cdApp.controller('MTurkValidationCtrl', 
   	['$scope', '$timeout', '$routeParams', 'growl',
   	function ($scope, $timeout, $routeParams, growl) {
   		
   		$scope.surveyStep = 1;

   		$scope.addStep = function(){
   			$scope.surveyStep = $scope.surveyStep + 1;
   		};

   		function getRandomInt (min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		var answerSet = ["Apples", "Chicago", "Welcome to Miami", "You're not in traffic, you are traffic", "baseball", "soccer", "Michigan", "basketball", "watermelon", "Taco", "Dingo"];

   		$scope.getRandomAnswer = function(){
   			var minimum = 0;
   			var maximum = answerSet.length -1;
   			var x = getRandomInt(minimum, maximum);

   			$scope.answer = answerSet[x];
   			$scope.$apply();
   		};
 		
 		$scope.getRandomAnswer();
   	}]);









