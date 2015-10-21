cdApp.controller('AvailabilityCtrl', 
    ['$scope', '$location', '$modal', '$log', 'growl', '$compile', 'uiCalendarConfig', 
    function ($scope, $location, $modal, $log, growl, $compile, uiCalendarConfig) {
      var currentUser = Parse.User.current();
      var userCalendarID;

    var startTime = new Date();
  startTime.setHours(9);
  startTime.setMinutes(0);

  var endTime = new Date();
  endTime.setHours(17);
  endTime.setMinutes(0);

  $scope.mondayStart = startTime;
  $scope.mondayEnd = endTime;


      var CalendarSettings = Parse.Object.extend("CalendarSettings");
      var query = new Parse.Query(CalendarSettings);
      query.equalTo("User", currentUser);
      query.find({
        success: function(results) {
          getCalendar(results[0].get('CalendarNumber'));
        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });

      function getCalendar (calid) {
        Parse.Cloud.run('pullCalendar', {
           "calID": calid
        }, {
          success: function(result) {
            console.log(result);
            var data = $.parseJSON(result);
            userCalendarID = data.resource['id'];
            console.log(data.resource.opening_hours_mon[0]);
            handleTimes(data.resource);

        },
          error: function(error) {
            console.log(error);
          }
        });

      };

function handleTimes (dt){
  var monRaw = dt.opening_hours_mon;
  var tuesRaw = dt.opening_hours_tue;
  var wedRaw = dt.opening_hours_wed;
  var thuRaw = dt.opening_hours_thu;
  var friRaw = dt.opening_hours_fri;
  var satRaw = dt.opening_hours_sat;
  var sunRaw = dt.opening_hours_sun;

  console.log("Tuesday Raw : " + tuesRaw);

  if (monRaw) {
    var st = Date.parse(monRaw[0]);
    var end = Date.parse(monRaw[1]);
    console.log(st);
    
    $scope.mondayStart = st;
    $scope.mondayEnd = end;
  };
  if (tuesRaw) {
    var st = Date.parse(tuesRaw[0]);
    var end = Date.parse(tuesRaw[1]);
    console.log("Tuesday Start is " + st);
    $scope.tuesdayStart = st;
    $scope.tuesdayEnd = end;
  } else {
    $scope.tuesdayStart = startTime;
    $scope.tuesdayEnd = endTime;

  };

  if (wedRaw) {
    var st = Date.parse(wedRaw[0]);
    var end = Date.parse(wedRaw[1]);
    console.log(st);
    
    $scope.wednesdayStart = st;
    $scope.wednesdayEnd = end;
  } else {
    $scope.wednesdayStart = startTime;
    $scope.wednesdayEnd = endTime;

  };
   if (thuRaw) {
    var st = Date.parse(thuRaw[0]);
    var end = Date.parse(thuRaw[1]);
    
    $scope.thursdayStart = st;
    $scope.thursdayEnd = end;
  } else {
    $scope.thursdayStart = startTime;
    $scope.thursdayEnd = endTime;

  };
   if (friRaw) {
    var st = Date.parse(friRaw[0]);
    var end = Date.parse(friRaw[1]);
    console.log(st);
    
    $scope.fridayStart = st;
    $scope.fridayEnd = end;
  } else {
    $scope.fridayStart = startTime;
    $scope.fridayEnd = endTime;

  };
   if (satRaw) {
    var st = Date.parse(satRaw[0]);
    var end = Date.parse(satRaw[1]);
    
    $scope.saturdayStart = st;
    $scope.saturdayEnd = end;
  } else {
    $scope.saturdayStart = startTime;
    $scope.saturdayEnd = endTime;

  };
   if (sunRaw) {
    var st = Date.parse(sunRaw[0]);
    var end = Date.parse(sunRaw[1]);
    
    $scope.sundayStart = st;
    $scope.sundayEnd = end;
  } else {
    $scope.sundayStart = startTime;
    $scope.sundayEnd = endTime;

  };
};

  

  $scope.hstep = 1;
  $scope.mstep = 15;

  $scope.options = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  $scope.ismeridian = true;
  $scope.toggleMode = function() {
    $scope.ismeridian = ! $scope.ismeridian;
  };

  $scope.update = function() {
    var d = new Date();
    d.setHours( 14 );
    d.setMinutes( 0 );
    $scope.mytime = d;
  };

  var monday = [];
  var tuesday = [];
  var wednesday = [];
  var thursday = [];
  var friday = [];
  var saturday = [];
  var sunday = [];


  $scope.changed = function () {
    //$log.log('Time changed to: ' + $scope.mondayStart);
    monday[0] = processTime($scope.mondayStart);
    monday[1] = processTime($scope.mondayEnd);
    tuesday[0] = processTime($scope.tuesdayStart);
    tuesday[1] = processTime($scope.tuesdayEnd);
    wednesday[0] = processTime($scope.wednesdayStart);
    wednesday[1] = processTime($scope.wednesdayEnd);
    thursday[0] = processTime($scope.thursdayStart);
    thursday[1] = processTime($scope.thursdayEnd);
    friday[0] = processTime($scope.fridayStart);
    friday[1] = processTime($scope.fridayEnd);
    saturday[0] = processTime($scope.saturdayStart);
    saturday[1] = processTime($scope.saturdayEnd);
    sunday[0] = processTime($scope.saturdayStart);
    sunday[1] = processTime($scope.saturdayEnd);

  };

  $scope.clear = function() {
    $scope.mytime = null;
  };

  function processTime(t){
    var hours = t.getHours()
    var min = t.getMinutes();
    if (min == 0) {
      min = "00"
    };
    var readable = hours + ":" + min;
    return readable;
  };


  $scope.saveAvailability = function (){
     Parse.Cloud.run('updateCalendar', {
           "calID": userCalendarID,
           "mon_hours": monday,
           "tues_hours": tuesday,
           "wed_hours": wednesday,
           "thu_hours": thursday,
           "fri_hours": friday,
           "sat_hours": saturday,
           "sun_hours": sunday
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