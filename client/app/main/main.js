'use strict';

angular.module('winatlifeApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/user/:userId', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        authenticate:  true
      });
  });