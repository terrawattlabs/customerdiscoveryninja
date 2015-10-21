'use strict';

angular
  .module('cdApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate',
    'textAngular',
    'angular-growl', 
    'angulartics', 
    'angulartics.google.analytics',
    'ui.bootstrap',
    'angularPayments',
    'ui.select',
    'angularWidget',
    'myDirectives',
    'angular-tour',
    'ui.calendar'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'views/untorch.html',
        controller: 'HomeCtrl'
      })
       .when('/hometest', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
       .when('/milvalchal', {
        templateUrl: 'views/hometest.html',
        controller: 'HomeCtrl'
      })
        .when('/setup', {
        templateUrl: 'views/setup.html',
        controller: 'SetupCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashCtrl'
      })
      .when('/takenotes/tour', {
        templateUrl: 'views/takenotestour.html',
        controller: 'TakeNotesCtrl'
      })
      .when('/takenotes', {
        templateUrl: 'views/takenotes.html',
        controller: 'TakeNotesCtrl'
      })
      .when('/waitforcall', {
        templateUrl: 'views/waitforcall.html',
        controller: 'WaitForCallCtrl'
      })
      .when('/newinterview/:projID/:templateID', {
        templateUrl: 'views/newinterview.html',
        controller: 'NewInterviewCtrl'
      })
      .when('/mturkvalidation/:primaryID/:secondaryID', {
        templateUrl: 'views/mturkvalidation.html',
        controller: 'MTurkValidationCtrl'
      })
      .when('/request/:projID', {
        templateUrl: 'views/request.html',
        controller: 'RequestCtrl'
      })
      .when('/interviews/', {
        templateUrl: 'views/interviews.html',
        controller: 'InterviewsCtrl'
      })
      .when('/interviewdetail/:projectID/:selID', {
        templateUrl: 'views/interviewdetail.html',
        controller: 'InterviewDetailCtrl'
      })
      .when('/intquestions/:projID/:questID', {
        templateUrl: 'views/intquestions.html',
        controller: 'IntQuestionsCtrl'
      })
      .when('/internal', {
        templateUrl: 'views/internal.html',
        controller: 'InternalCtrl'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .when('/testpage', {
        templateUrl: 'views/testpage.html',
        controller: 'TestpageCtrl'
      })
      .when('/home/faq', {
        templateUrl: 'views/faq.html'
      })
      .when('/home/howitworks', {
        templateUrl: 'views/howitworks.html'
      })
      .when('/home/pricing', {
        templateUrl: 'views/pricing.html'
      })
      .when('/home/aboutus', {
        templateUrl: 'views/aboutus.html'
      })
      .when('/projects', {
        templateUrl: 'views/projects.html',
        controller: 'ProjCtrl'
      })
      .when('/cdndash', {
        templateUrl: 'views/cdndash.html',
        controller: 'CDNDashCtrl'
      })
      .when('/segments', {
        templateUrl: 'views/segments.html',
        controller: 'SegmentsCtrl'
      })
      .when('/projdetail/:selID', {
        templateUrl: 'views/projdetail.html',
        controller: 'ProjDetailCtrl'
      })
      .when('/schedule/:calID', {
        templateUrl: 'views/schedule.html',
        controller: 'ScheduleCtrl'
      })
      .when('/availability', {
        templateUrl: 'views/availability.html',
        controller: 'AvailabilityCtrl'
      })

      .otherwise({
        redirectTo: '/'
      });
  });
