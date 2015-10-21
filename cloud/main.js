// Include Cloud Code module dependencies
var express = require('express');
    twilio = require('twilio');

var Stripe = require('stripe');
// LIVE KEY
// Stripe.initialize('sk_live_LpYrmwsewIXcsQgNCbNq4XyG');


//TEST KEY
Stripe.initialize('sk_test_phZEoWWVBafgg76mObesKQQG');

var SendGrid = require("sendgrid");  
SendGrid.initialize("customer_ninja", "courthouse1327");


// Create an Express web app (more info: http://expressjs.com/)
var app = express();

app.use(express.bodyParser());

app.get('/test/:example', function (request, response) {
  var example = request.params.example;
  response.send(example);

});

app.get('/mturk/test', function (request, response) {
      // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();

    // add some instructions
    twiml.say('Thank you for calling, we are currently interviewing other people. Please try one more time in fifteen minutes.', {
        voice:'alice',
        language:'en-gb'
    });
   // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());


});


// Create a route that will respond to am HTTP GET request with some
// simple TwiML instructions
app.get('/api/incoming/:clientID', function (request, response) {
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();
    var clientName = request.params.clientID;
    // add some instructions

    twiml.dial(function (res) {
      res.client(clientName);
    }, { action: "http://custdiscdev.parseapp.com/recording", record: "record-from-answer", method: "POST" });
    twiml.say('goodbye');

 
    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());

    
});

app.post('/api/outgoing', function (request, response) {
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();
    var phone = request.body.PhoneNumber;
    var callerID = request.body.FromNumber;
    
    // add some instructions
    twiml.dial(function (res) {
      res.number(phone);
    }, { callerId: callerID, action: "http://custdiscdev.parseapp.com/recording", record: "record-from-answer", method: "POST"});

 
    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
  

    
});

app.post('/api/events', function (request, response) {
    var customerID = request.body.data.object.customer;
    var eventType = request.body.type;

    if (eventType == "invoice.payment_succeeded") {
      console.log(customerID);
    };

    response.send(200);
  

    
});



app.post('/recording', function (request, response) {
    var msgURL = request.body.RecordingUrl;
    var msgSID = request.body.DialCallSid;
    var msgDuration = request.body.RecordingDuration;

    var Message = Parse.Object.extend("Message");
    var message = new Message();

   

        message.set("location", msgURL);
        message.set("sid", msgSID);
        message.set("duration", msgDuration);

    if (msgDuration) {
      message.save(null, {
         success: function(msg) {
            // Execute any logic that should take place after the object is saved.
            //alert('New object created with objectId: ' + msg.id + '    ' + msg.location);
           //console.log('available numbers: ' + JSON.stringify(number));
            //return res.json(200, msg);
         },
         error: function(message, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and description.
            //alert('Failed to create new object, with error code: ' + error.message);
        }
        });
    };

    
    // Create a TwiML response generator object
    var twiml = new twilio.TwimlResponse();
    
    twiml.say('Thank you for calling, we are currently interviewing other people. Please try one more time in fifteen minutes.', {
        voice:'alice',
        language:'en-gb'
    });

 
    // Render the TwiML XML document
    response.type('text/xml');
    response.send(twiml.toString());
  


});


// Start the Express app
app.listen();

Parse.Cloud.define("getToken", function (request, response) {

     var sid = "AC73f7249b29a458ccfb05e1ca469023aa";
     var appsid = "AP7f88a8f239420c571826bd3ceaa01f9e";
     var auth = request.params.authToken;
     var capability = new twilio.Capability(sid, auth);
     var userID = request.params.userID;
     //sid "AC73f7249b29a458ccfb05e1ca469023aa"
     // auth token "da9c29a9a9ceda42b101242c8b5bfdb9"

    //Create a capability token for a client named "jenny"
    capability.allowClientIncoming(userID);
    capability.allowClientOutgoing(appsid);
    var token = capability.generate();

  response.success(token);
});

Parse.Cloud.define("notifyTexts", function (request, response) {
      // Require and initialize the Twilio module with your credentials
    var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
    var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
    var client = require('twilio')(accountSid, authToken);

    var msgBody = request.params.message;
    var msgToList = ["+19082954795", "+17347309858"];

      
    for (var i = msgToList.length - 1; i >= 0; i--) {

           // Send an SMS message
            client.sendSms({
                to: msgToList[i], 
                from: '+17345488509', 
                body: msgBody
              }, function (err, responseData) { 
                if (err) {
                  console.log(err);
                } else { 
                  console.log(responseData.from); 
                  console.log(responseData.body);
                  response.success(responseData.body);
                }
              }
            );
    };
}); //end notify texts

Parse.Cloud.define("createPayment", function (request, response) {

     var token = request.params.token;
     var chargeAmount = request.params.dollars;
     var chargeDesc = request.params.desc;
     var chargeEmail = request.params.email;
     var chargeCust = request.params.custID;
     
     Stripe.Charges.create({
          amount: chargeAmount * 100, // expressed in cents
          currency: "usd",
          description: chargeDesc,
          customer: chargeCust // the token id should be sent from the client
        }, {
          success: function(httpResponse) {
            response.success("Purchase made!");
          },
          error: function(httpResponse) {
            response.error("Uh oh, something went wrong");
          }
        });
});


Parse.Cloud.define("addStripeCard", function (request, response) {
      var token = request.params.token;
      var customer = request.params.customer;

      Stripe.customers.createCard(
          customer,
          {card: token},
          function(err, card) {
            response.success(card);
          }
        );
});

Parse.Cloud.define("getCoupon", function (request, response){
  var coupID = request.params.givenCode;

  Stripe.Coupons.retrieve(coupID, {
    success: function(httpResponse) {
      response.success(httpResponse);
    },
    error: function(httpResponse) {
      response.error(httpResponse);
    }
  });
});

Parse.Cloud.define("createCustomer", function (request, response) {
      var custCard = request.params.card;
      var custEmail = request.params.email;
      var custCoupon = request.params.coupon;
      var custDesc = request.params.description;
      var custPlan = request.params.plan;


    if (custCoupon) {
      Stripe.Customers.create({
        card: custCard,
        email: custEmail,
        coupon: custCoupon,
        description: custDesc,
        plan: custPlan
      }, {
          success: function(httpResponse) {
            response.success(httpResponse);
          },
          error: function(httpResponse) {
            response.error("Uh oh, something went wrong");
          }
      });
    } else {
       Stripe.Customers.create({
        card: custCard,
        email: custEmail,
        description: custDesc,
        plan: custPlan
      }, {
          success: function(httpResponse) {
            response.success(httpResponse);
          },
          error: function(httpResponse) {
            response.error("Uh oh, something went wrong");
          }
      });
    }
     

});


Parse.Cloud.define("getTotalRecordings", function (request, response) {
    var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
    var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
    var client = require('twilio')(accountSid, authToken);
    var allDuration = [];

      client.recordings.get({   
          pageSize: "1000",  
        }, function(err, data) { 
          data.recordings.forEach(function (recording) {
           var toNumber = parseFloat(recording.duration); 
           allDuration.push(toNumber);
           
          }); 
          response.success(allDuration); 
        });

      // client.usage.records.get({ 
      //     category: "calls",   
      //   }, function (err, data) {
      //     console.log(data.usage_records[0].usage); 
      //     response.success(data.usage_records[0].usage);
      //   });
});


Parse.Cloud.define("getAvailNumbers", function (request, response) {
    var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
    var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
    var client = require('twilio')(accountSid, authToken);
    var area = request.params.areaCode;

      client.availablePhoneNumbers('US').local.get({ 
          areaCode: area,         
        }, function (err, data) { 
          data.incomingPhoneNumbers;
          response.success(data.available_phone_numbers);
        });
});


Parse.Cloud.define("purchaseNumber", function (request, response) {
      var accountSid = 'AC73f7249b29a458ccfb05e1ca469023aa';
      var authToken = 'da9c29a9a9ceda42b101242c8b5bfdb9';
      var client = require('twilio')(accountSid, authToken);
      var userEmail = request.params.email;
      var userID = request.params.userID;
      var phoneNumber = request.params.phone;

      client.incomingPhoneNumbers.create({
          friendlyName: userEmail,
          voiceUrl: "http://custdiscdev.parseapp.com/api/incoming/" + userID,
          phoneNumber: phoneNumber,
          voiceMethod: "GET"
      }, function (err, number) {
          process.stdout.write(number.sid);
          response.success(number);
});

});





//  Mechanical Turk API Stuff


// Crypto JS library is not written to use as node js modules so either we need to copy that file directly into this or we need
// to include using fs module
var fs = require('fs');
eval(fs.readFileSync('cloud/hmac-sha1.js')+'');

// Please change these keys when deploying on new server
var awsAccessKey = "AKIAJ7X5NFPYJFCIIT7A";
var awsSecretKey = "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";
var url = 'https://mechanicalturk.sandbox.amazonaws.com/';
// var url = 'https://mechanicalturk.amazonaws.com/';

// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("createHIT", function (request, response) {

  // Fetch parameters from request
  var title = request.params.title;
  var description = request.params.description;
  var question = request.params.question;
  var numHITS = request.params.numHITS;
  var reward = request.params.reward;
  var duration = request.params.duration * 60;
  
  postRequest(response, title, description, question, numHITS, reward, duration);
});

// This method used to send request on Mechanical Turk to create HITs
function postRequest(response, title, description, question, numHITS, reward, duration) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: url,
    body: {
    Service: 'AWSMechanicalTurkRequester',
    AWSAccessKeyId: awsAccessKey,
    Version: '2008-08-02',
    Operation: 'CreateHIT',
    Signature: generateSignature("AWSMechanicalTurkRequester", "CreateHIT"),
    Timestamp: getTimeStamp(),
    Title: title,
    Description: description,
    Question: createQuestion(question),
    AssignmentDurationInSeconds: '36000',
    LifetimeInSeconds: duration,
    Keywords: 'fun,phone,easy,quick',
    MaxAssignments: numHITS,
    AutoApprovalDelayInSeconds: '360000',
    "QualificationRequirement.1.QualificationTypeId": '00000000000000000071',
    'QualificationRequirement.1.Comparator': 'In',
    'QualificationRequirement.1.LocaleValue.1.Country':'US',
    'Reward.1.Amount': reward,
    'Reward.1.CurrencyCode': 'USD'
    },
    success: function(httpResponse) {
    console.log(httpResponse.text);
    response.success(httpResponse.text);
    },
    error: function(httpResponse) {
    console.log(httpResponse.text);
    console.error('Request failed with response code ' + httpResponse.status);
    response.error('Request failed with response code ' + httpResponse.status);
    }
  });
}

function generateSignature(service, operation){
  var timestamp = getTimeStamp();
  var myKey = service+operation+timestamp;
   
  var stringToSign =myKey;
  var key = awsSecretKey;
  var hash = CryptoJS.HmacSHA1(stringToSign, key);
  var signature = hash.toString(CryptoJS.enc.Base64)
  
  return signature;
}

function ISODateString(d){
  function pad(n){
    return n<10 ? '0'+n : n
  }
  return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds()+1)+'Z'
}   

function getTimeStamp (){
  var d = new Date();
  var timestamp = (ISODateString(d));
  return timestamp;
}
    
// This method used to create question parameter XML
function createQuestion(question) {
  var questions = "<QuestionForm xmlns='http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd'>"
              + "<Question>"
              +   "<QuestionIdentifier>question_id</QuestionIdentifier>"
              +   "<DisplayName>"+question+"</DisplayName>"
              +   "<IsRequired>true</IsRequired>"
              +   "<QuestionContent>"
              +     "<Text>"+question+"</Text>"
              +   "</QuestionContent>"
              + "<AnswerSpecification><FreeTextAnswer><NumberOfLinesSuggestion>1</NumberOfLinesSuggestion></FreeTextAnswer></AnswerSpecification>"
              + "</Question>"
              + "</QuestionForm>";
              
  //console.log("Questions:" + questions);
  return questions;
};


Parse.Cloud.define("sendEmail", function (request, response) {
         var sendTo = request.params.recipient;
         var sendFrom = request.params.sender;
         var sendSubject = request.params.subject;
         var sendText = request.params.bodyText;
         var sendHTML = request.params.bodyHTML;

         SendGrid.sendEmail({
            to: sendTo,
            from: sendFrom,
            subject: sendSubject,
            text: sendText,
            html: sendHTML
          }, {
            success: function(httpResponse) {
              console.log(httpResponse);
              response.success("Email sent!");
            },
            error: function(httpResponse) {
              console.error(httpResponse);
              response.error("Uh oh, something went wrong");
            }
          });

});


Parse.Cloud.job("SubmitHITs", function (request, status) {
       var today = new Date();
        var high = new Date();
        var low = new Date();
        var highMin = today.getMinutes() + 10;
        var lowMin = today.getMinutes() - 10;

        //var timeZoneOffset = today.getHours() - 5;

        //high.setHours(timeZoneOffset);
        //low.setHours(timeZoneOffset);

        var topRange = high.setMinutes(highMin);
        var lowRange = low.setMinutes(lowMin);



        var lowBound = new Date(lowRange);
        var highBound = new Date(topRange);


      var Scheduled = Parse.Object.extend("Scheduled");
      var query = new Parse.Query("Scheduled");
      query.greaterThan("dateTime", lowBound);
      query.lessThan("dateTime", highBound);

        query.find({
          success: function(results) {
            console.log(results);
            findSegments(results);
            // post open Amhit() with the user
            postAmhit(results);
            sendSummaryEmail(results.length);
            
          },
          error: function() {
            results.error("location failed");
          }
        });

  function makeid (digits){
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < digits; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    };
        
      function findSegments (res) {
          var foundSegment;
          var schedObj;
          

          var rand1 = makeid(20);
          var rand2 = makeid(20);

          var customURL = "http://customerdiscovery.parseapp.com/#/mturkvalidation/" + rand1 + "/" + rand2;


        for (var i = res.length - 1; i >= 0; i--) {
          // for each item, find the info for the hit and send
          // get the segment information from parse
          // submit the segment description into the HIT Function
          // easy peasy

          findCustomerEmail(res[i].get('user'));

          console.log(res[i].get('phone'));

          var segID = res[i].get('segmentID');
          var phoneNumber = res[i].get('phone');
          var durationTime = res[i].get('duration');
          var ints = res[i].get('interviews');
          var question = res[i].get('MTurkQuestion');
          var title = res[i].get('MTurkTitle');
          var description = res[i].get('MTurkDescription');
          var reward = res[i].get('MTurkReward');

           Parse.Cloud.run('createHIT', {
                   "title": title,
                   "description": description,
                   "question": question + ", please Call *67 " + phoneNumber + " (Note that dialing *67 before the number keeps your phone number anonymous). After the call, go to this link to retrieve your response for this HIT (just so we can validate that you did the HIT). " + customURL,
                   "numHITS": ints,
                   "reward": reward,
                   "duration": durationTime
                }, {
                  success: function(result) {
                    console.log(result);
                },
                  error: function(error) {
                    //console.log(error);
                  }
                });

          //findSegPostHIT(segID, phoneNumber, durationTime, ints, customURL);

        };
      };

      function findSegPostHIT (segID, phone, dur, ints, customURL){
        var Segment = Parse.Object.extend("Segment");
        var query = new Parse.Query(Segment);
        console.log('below is the segment ID');
        console.log(segID);
        query.get(segID, {
          success: function(seg) {

            console.log('below is the segment that gets pulled');
            console.log(seg);
            // post the HIT from the server
            //postHIT(seg, phoneNumber, durationTime, ints);
           

          },
          error: function(seg, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
          }
        });
      };




      function postHIT (seg, phone, duration, ints){
         var rand1 = makeid(20);
        var rand2 = makeid(20);
        var customURL = "http://customerdiscovery.parseapp.com/#/mturkvalidation/" + rand1 + "/" + rand2;

        // console.log('got to POST HIT FUNCTION');
        // console.log(phone);
        // console.log(duration);
        // console.log(url);
        // console.log(ints);
          

         // Parse.Cloud.run('createHIT', {
         //           "title": seg.get('MTTitle'),
         //           "description": seg.get('MTDescription'),
         //           "question": seg.get('MTQuestion') + ", please Call *67 " + phone + " (Note that dialing *67 before the number keeps your phone number anonymous). After the call, go to this link to retrieve your response for this HIT (just so we can validate that you did the HIT). " + customURL,
         //           "numHITS": ints,
         //           "reward": seg.get('MTReward'),
         //           "duration": duration
         //        }, {
         //          success: function(result) {
         //            //console.log(result);
         //        },
         //          error: function(error) {
         //            //console.log(error);
         //          }
         //        });
      };

      function postAmhit (res) {
        for (var i = res.length - 1; i >= 0; i--) {
          // for each item post to Amhit
          // should have everything you need in the res otherwise post everything needed there for ease
          var Amthits = Parse.Object.extend("Amthits");
        var amthits = new Amthits();
         
        var requestedInterviews = res[i].get('interviews').toString();

        amthits.set("status", "pending");
        amthits.set("user", res[i].get('user'));
        amthits.set("reqInterviews", requestedInterviews);
        amthits.set('duration', res[i].get('duration'));
        amthits.set('completed', 0);
         
        amthits.save(null, {
          success: function(amthits) {
            //console.log(amthits);
          },
          error: function(amthits, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('Failed to create new object, with error code: ' + error.message);
          }
        });

      


        }; // ends for loop

      }; // end postAMhit function

      function sendSummaryEmail (num) {
        var today = new Date();
        var high = new Date();
        var low = new Date();
        var highMin = today.getMinutes() + 10;
        var lowMin = today.getMinutes() - 10;

        var timeZoneOffset = today.getHours() - 5;

        high.setHours(timeZoneOffset);
        low.setHours(timeZoneOffset);

        var topRange = high.setMinutes(highMin);
        var lowRange = low.setMinutes(lowMin);



        var lowBound = new Date(lowRange);
        var highBound = new Date(topRange);

        var funcTesting = calcTime('-5');

        // Parse.Cloud.run('sendEmail', {
        //     "recipient": "info@customerdiscovery.ninja",
        //     "sender": "info@customerdiscovery.ninja",
        //     "subject": "Send Scheduled HITs Function Run",
        //     "bodyText": "The cloud code function ran the job to send scheduled HITs. There were " 
        //     + num + 
        //     " Scheduled interview sets this time." 
        //     + today + " low bound is: " 
        //     + lowBound + "..... high bound: " 
        //     + highBound + "...."
        //     + " The tested function returned this thing: " + funcTesting

        // }, {
        //   success: function(result) {
        //     // console.log(result);
        
        // },
        //   error: function(error) {
        //     // console.log(error);
        //   }
        // });
      };

function calcTime(offset) {
    d = new Date();

    //Deal with dates in milliseconds for most accuracy
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    newDateWithOffset = new Date(utc + (3600000*offset));

    //This will return the date with the locale format (string), or just return newDateWithOffset
    //and go from there.
    return newDateWithOffset;

};



function findCustomerEmail (userID) {
    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.equalTo("objectId", userID.id);
    query.find({
      success: function(results) {
        sendCustomerEmail(results[0].get('email'), results[0].get('name'));
      },
      error: function(error) {
        
      }
    });

};

function sendCustomerEmail(email, name){
  console.log('trying to send an email here');
    Parse.Cloud.run('sendEmail', {
            "recipient": email,
            "sender": "info@customerdiscovery.ninja",
            "subject": name + " Your Scheduled Interviews are Starting Now!",
            "bodyHTML": "<p>Hi " + name + ",</p>" + 
            "<p>You've scheduled interviews on Customer Discovery Ninja and they are about to start.</p>" + 
            "<a href='http://customerdiscovery.parseapp.com/#/dashboard'>Click here to receive your calls</a>" + 
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

});



// formcrafts form POST handling

app.post('/formcrafts/free', function (request, response) {

    var obj = request.body;

    var email = obj['Email'];
    var phone = obj['Phone Number'];
    var customer = obj['Who is your customer?'];

    var rand1 = "al;skdjf;alksjdf;lakjsdf";
    var rand2 = "asdfkjaskdfjkasjdf43234j2lk3"

    var customURL = "http://customerdiscovery.parseapp.com/#/mturkvalidation/" + rand1 + "/" + rand2;


     Parse.Cloud.run('createHIT', {
                   "title": "Short Market Research - Phone Interview",
                   "description": "5-10 minute phone interview",
                   "question": "If you meet this description - " + customer + ", please Call *67 " + phone + " (Note that dialing *67 before the number keeps your phone number anonymous). After the call, go to this link to retrieve your response for this HIT (just so we can validate that you did the HIT). " + customURL,
                   "numHITS": 1,
                   "reward": 1.25,
                   "duration": 60
                }, {
                  success: function(result) {
                    console.log(result);
                },
                  error: function(error) {
                    //console.log(error);
                  }
                });


});


// formcrafts form POST handling FOR PAID SUBMISSIONS

app.post('/formcrafts/paid', function (request, response) {

    var obj = request.body;

    var email = obj['Email'];
    var phone = obj['Phone Number'];
    var customer = obj['Who is your customer?'];

    var rand1 = "al;skdjf;alksjdf;lakjsdf";
    var rand2 = "asdfkjaskdfjkasjdf43234j2lk3"

    var customURL = "http://customerdiscovery.parseapp.com/#/mturkvalidation/" + rand1 + "/" + rand2;


     Parse.Cloud.run('createHIT', {
                   "title": "Short Market Research - Phone Interview",
                   "description": "5-10 minute phone interview",
                   "question": "If you meet this description - " + customer + ", please Call *67 " + phone + " (Note that dialing *67 before the number keeps your phone number anonymous). After the call, go to this link to retrieve your response for this HIT (just so we can validate that you did the HIT). " + customURL,
                   "numHITS": 1,
                   "reward": 3.05,
                   "duration": 60
                }, {
                  success: function(result) {
                    console.log(result);
                },
                  error: function(error) {
                    //console.log(error);
                  }
                });


});


// Slack Stuff

// Send Interview Requests to Slack
Parse.Cloud.define("slackRelay", function (request, response) {
    var msg = request.params.message;



  Parse.Cloud.httpRequest({
    method: 'POST',
    url: "https://hooks.slack.com/services/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",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: {"text": msg},
    success: function(httpResponse) {
     console.log(httpResponse.text);
      response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.status);
    }
  });        

});




// MakePlans Calendar Stuff ============================================================================================

var baseURL = "http://customerdiscovery.test.makeplans.net/api/v1/";
var authorizationEnc = "Basic NzM0MmY4OGE3ZDNiNGI0M2MzNTZhZGZiYzc5ODQ4NTI6Cg==";
var userAgent = "Customerdiscovery (info@customerdiscovery.ninja)";

// make a new calendar
Parse.Cloud.define("newCalendar", function (request, response) {
  var resourceURL = "resources";
  var liveUrl = baseURL + resourceURL;
  console.log(url);

  Parse.Cloud.httpRequest({
    method: 'POST',
    url: liveUrl,
    headers: {
      "Authorization": authorizationEnc,
      "Accept": "application/json",
      "User-Agent": userAgent
    },
    body: "resource[title]=Hello World Calendar",
    success: function(httpResponse) {
     console.log(httpResponse.text);
      response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.status);
    }
  });        

});


// pull a user's calendar information
Parse.Cloud.define("pullCalendar", function (request, response) {
  var resourceURL = "resources/";
  var resourceID = request.params.calID;
  var liveUrl = baseURL + resourceURL + resourceID;
  console.log(liveUrl);
  

  Parse.Cloud.httpRequest({
    method: 'GET',
    url: liveUrl,
    headers: {
      "Authorization": authorizationEnc,
      "Accept": "application/json",
      "User-Agent": userAgent
    },
    success: function(httpResponse) {
     console.log(httpResponse.text);
      response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.status);
    }
  });        

});

// update a user's calendar information
Parse.Cloud.define("updateCalendar", function (request, response) {
  var resourceURL = "resources/";
  var resourceID = request.params.calID;
  var mondayHours = request.params.mon_hours;
  var tuesdayHours = request.params.tues_hours;
  var wednesdayHours = request.params.wed_hours;
  var thursdayHours = request.params.thu_hours;
  var fridayHours = request.params.fri_hours;
  var saturdayHours = request.params.sat_hours;
  var sundayHours = request.params.sun_hours;
  var liveUrl = baseURL + resourceURL + resourceID;
  

  Parse.Cloud.httpRequest({
    method: 'PUT',
    url: liveUrl,
    headers: {
      "Authorization": authorizationEnc,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent
    },
    body: {
      "resource" : {
        "opening_hours_mon": mondayHours,
        "opening_hours_tue": tuesdayHours,
        "opening_hours_wed": wednesdayHours,
        "opening_hours_thu": thursdayHours,
        "opening_hours_fri": fridayHours,
        "opening_hours_sat": saturdayHours,
        "opening_hours_sun": sundayHours

      }
    },
    success: function(httpResponse) {
     console.log(httpResponse.text);
      response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.status);
    }
  });        

});

//Pull slots for a service with a calendar in the query
Parse.Cloud.define("pullSlots", function (request, response) {
  var slotsURL = "services/375/slots";
  var resourceID = request.params.calID;
  var liveUrl = baseURL + slotsURL;
  var calID = request.params.calID;

  var endDate = request.params.toDate;
  console.log(endDate);



  Parse.Cloud.httpRequest({
    method: 'GET',
    url: liveUrl,
    headers: {
      "Authorization": authorizationEnc,
      "Accept": "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent
    },
    body: {
      "to": endDate,
      "selected_resources" : [calID],
      "only_free" : true
      
    },
    success: function(httpResponse) {
     console.log(httpResponse.text);
      response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.status);
    }
  });        

});


//Create a booking
Parse.Cloud.define("createBooking", function (request, response) {
  var bookingURL = "bookings";
  var liveUrl = baseURL + bookingURL;
  var calID = request.params.calID;
  var start = request.params.bookedFrom;
  var end = request.params.bookedTo;

  var endDate = request.params.toDate;
  console.log(endDate);

  var bodyString = "booking[resource_id]=" + calID + "&" +
  "booking[booked_from]=" + start + "&" +
  "booking[booked_to]=" + end;


  Parse.Cloud.httpRequest({
    method: 'POST',
    url: liveUrl,
    headers: {
      "Authorization": authorizationEnc,
      "Accept": "application/json",
      // "Content-Type": "application/json",
      "User-Agent": userAgent
    },
    body: bodyString,
    success: function(httpResponse) {
     console.log(httpResponse.text);
    response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      response.error('There was an error -  ' + httpResponse.text);
    }
  });        

});


//Create a booking
Parse.Cloud.define("sendKlaviyo", function (request, response) {
 var endpoint = "https://a.klaviyo.com/api/track";
 var datapoint = request.params.encdata;

 var fullURL = endpoint + "?data=" + datapoint;

  Parse.Cloud.httpRequest({
    method: 'GET',
    url: fullURL,
    success: function(httpResponse) {
     console.log(httpResponse.text);
    response.success(httpResponse.text);
    },
    error: function(httpResponse) {
      //response.error(fullURL);
      console.log(httpResponse.text);
      console.error('Request failed with response code ' + httpResponse.status);
      //response.error('There was an error -  ' + httpResponse.text);
    }
  });        

});

