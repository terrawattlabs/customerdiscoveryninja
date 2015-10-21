cdApp.controller('ScheduleCtrl', 
    ['$scope', '$location', '$modal', '$log', 'growl', '$compile', 'uiCalendarConfig', '$routeParams', 
    function ($scope, $location, $modal, $log, growl, $compile, uiCalendarConfig, $routeParams) {
      
    
$scope.testFunction = function (){
    console.log('ran the function');
    Parse.Cloud.run('newCalendar', {}, {
          success: function(result) {
            //console.log(result);
            
        },
          error: function(error) {
            console.log(error);
          }
        });

    };

var calendarID = parseFloat($routeParams.calID);

var companyName;
// find the user with this calendar
var CalendarSettings = Parse.Object.extend("CalendarSettings");
var query = new Parse.Query(CalendarSettings);
query.equalTo("CalendarNumber", calendarID);
query.find({
  success: function(results) {
    findCustomer(results[0].get('User').id);
    companyName = results[0].get('companyName');
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});

var cust_name;
var cust_email;

function findCustomer (id) {
  var User = Parse.Object.extend("User");
  var query = new Parse.Query(User);
  query.get(id, {
    success: function(user) {
      cust_email = user.get('email');
      cust_name = user.get('name');
      cust_phone = user.get('number');
    },
    error: function(object, error) {
      // The object was not retrieved successfully.
      // error is a Parse.Error with an error code and message.
    }
  });
};

    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth();
    var year = today.getFullYear();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var numDays = daysInMonth(today.getMonth(),year);
    var daysLeft = numDays - day;
    var monthAdd = 0;
    var setDays;
    var yearAdd = 0;

    console.log(month);

    if (daysLeft < 7) {
      monthAdd = 1;
      setDays = 7 - daysLeft + 1;
      if (month == 11) {
        yearAdd = 1;
      };

    } else {
      monthAdd = 0;
      setDays = day + 7;
    };

    var toDate = new Date();
    toDate.setMonth(month + monthAdd)
    toDate.setDate(setDays);
    toDate.setYear(year + yearAdd);
    console.log(toDate);

    var finalDate;
    if (setDays < 10) {
      finalDate = "0" + setDays;
    };

    var finalYear = year + yearAdd;
    var finalMonth = month + monthAdd;

    if (finalMonth < 10) {
      finalMonth = "0" + finalMonth;
    };

    var ISOtoDate = toDate.toISOString();
    console.log(ISOtoDate);

    var formattedDate = year + "-" + finalMonth + "-" + finalDate + "T" + hours + ":" + minutes;

    console.log(formattedDate);

    $scope.pullSlots = function (){
      console.log('tried to pull slots');
     Parse.Cloud.run('pullSlots', {
           "calID": $routeParams.calID,
           "toDate": ISOtoDate
        }, {
          success: function(result) {
            console.log(result);
            var data = $.parseJSON(result);
            console.log(data.length);
            $scope.blocks = data;
            $scope.$apply();

        },
          error: function(error) {
            console.log(error);
          }
        });

  };

  function daysInMonth(month,year) {
    return new Date(year, month, 0).getDate();
    };

  $scope.pullSlots();

 $scope.selected = function (b) {
  $scope.chosenTimeObj = $scope.blocks[b].slot;
  $scope.chosenTimeFormat = $scope.chosenTimeObj["formatted_timestamp"];
  console.log(b);
  $scope.isSelected = true;

 };

 $scope.isSelected = false;
 $scope.showSuccess = false;
 $scope.inProcess = true;
 $scope.showInfo = false;

 $scope.showInfoBox = function (){
  $scope.showInfo = true;
 };

  $scope.showConfirm = function (){

    return $scope.isSelected;
  };

  $scope.bookSlot = function (){
    var bookStart = $scope.chosenTimeObj["timestamp"];
    var bookEnd = $scope.chosenTimeObj["timestamp_end"];
    console.log(bookStart);
    console.log(bookEnd);

      Parse.Cloud.run('createBooking', {
           "calID": $routeParams.calID,
           "bookedFrom": bookStart,
           "bookedTo": bookEnd
        }, {
          success: function(result) {
            console.log(result);
            var data = $.parseJSON(result);
            greatSuccess(data);
            $scope.$apply();

        },
          error: function(error) {
            console.log(error);
          }
        });

  };

  function greatSuccess(dt){
    $scope.isSelected = false;
    $scope.showSuccess = true;
    $scope.inProcess = false;
    $scope.showInfo = false;

    var bookedDateStart = $scope.chosenTimeFormat;

    //variables for the email sending
    // send Userflock Customer an Email
    Parse.Cloud.run('sendEmail', {
            "recipient": cust_email,
            "sender": "hello@userflock.com",
            "subject": "You've Got a New Interview Scheduled with " + $scope.user_name,
            "bodyHTML": "<p>Hi " + cust_name + ",</p>" + 
            "<p>You've got an interview with one of your customers.</p>" +
            "<ul>" +
            "<li><strong>Name:</strong> " + $scope.user_name + "</li>" +
            "<li><strong>Email:</strong> " + $scope.user_email + "</li>"+
            "<li><strong>Date / Time:</strong> " + bookedDateStart + "</li>" +
            "<li><strong>They added some notes:</strong> " + $scope.user_notes + "</li>" +
            "</ul>" +
            "<p>Thanks!</p>" +
            "<p>The CDN Team!</p>"

        }, {
          success: function(result) {
            // console.log(result);
        
        },
          error: function(error) {
            // console.log(error);
          }
        });


// google calendar link format

// https://www.google.com/calendar/render?action=TEMPLATE&text=Summary%20of%20the%20event&dates=20150807T090000/20150807T110000&ctz=America/New_York&details=Description%20of%20the%20event&location=Location%20of%20the%20event&pli=1&uid=&sf=true&output=xml#eventpage_6

    // send End User an Email
    Parse.Cloud.run('sendEmail', {
            "recipient": $scope.user_email,
            "sender": "hello@userflock.com",
            "subject": "You've Scheduled an Interview With " + companyName,
            "bodyHTML": "<p>Hi " + $scope.user_name + ",</p>" + 
            "<p>You've scheduled interviews with a " + companyName + " at " + bookedDateStart + "</p>" +
            "<p>At that time, just call this phone number at that time: " + cust_phone +
            "<p>If you have any questions you can email them at: " + cust_email + "</p>" +
            "<p>Thanks!</p>" +
            "<p>The CDN Team!</p>"

        }, {
          success: function(result) {
            // console.log(result);
        
        },
          error: function(error) {
            // console.log(error);
          }
        });
  };

  }]);