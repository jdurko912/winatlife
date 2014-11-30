'use strict';

angular.module('winatlifeApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          login: $scope.user.login,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/user/'.concat($scope.user.login));
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
