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