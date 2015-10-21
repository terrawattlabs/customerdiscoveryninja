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