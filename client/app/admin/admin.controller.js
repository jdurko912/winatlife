'use strict';

angular.module('winatlifeApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.newevent = {};

    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    }


    $http.get('/api/events').success(function(awesomeEvents) {
        $scope.awesomeEvents = awesomeEvents;
    });

    $scope.deleteUser = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.deleteEvent = function(event) {
        $http.delete('/api/events/'.concat(event._id)).success(function (){
            angular.forEach($scope.awesomeEvents, function(e, i) {
                if (e === event) {
                    $scope.awesomeEvents.splice(i, 1);
                }
            });
            $scope.alerts.push({type: 'success', msg: 'Event successfully removed'});
        })
        .error(function(data, status) {
                $scope.alerts.push({type:  'danger', msg:  'Problem with Server Request:  '
                    .concat(status).concat(':  ').concat(status)});
            });
    };

    $scope.addEvent = function(form) {
        $scope.submitted = true;
        if(form.$valid) {
            Auth.createUser({
                name: $scope.user.name,
                login:  $scope.user.login,
                email: $scope.user.email,
                password: $scope.user.password
            })
                .then( function() {
                    // Account created, redirect to home
                    $location.path('/user/'.concat($scope.user.login));
                })
                .catch( function(err) {
                    err = err.data;
                    $scope.errors = {};

                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                });
        }
        $scope.submitted = false;
    };
  });
