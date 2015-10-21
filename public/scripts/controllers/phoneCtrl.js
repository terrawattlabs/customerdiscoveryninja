cdApp.controller('PhoneCtrl', 
   	['$scope', '$timeout', 'shareCallSID', '$interval', 'intCounterFactory', 'growl',
   	function ($scope, $timeout, shareCallSID, $interval, intCounterFactory, growl) {

   		var currentUser = Parse.User.current();
   		$scope.userNumber = currentUser.get('number');

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

    $scope.call = function (){
 		var params = { "PhoneNumber" : $scope.dialNumber, "FromNumber": $scope.userNumber };
 		connection = Twilio.Device.connect(params);
 		console.log($scope.dialNumber);
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
            window.location.href = "#/takenotes";

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