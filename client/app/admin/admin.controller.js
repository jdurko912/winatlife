'use strict';

angular.module('winatlifeApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Event) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.awesomeEvents = Event.query();
    $scope.newevent = {};

    $scope.alerts = [];
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    }

    $scope.deleteUser = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.deleteEvent = function(event) {
        Auth.deleteEvent(event).success(function (){
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
            var newAttrs = [];
            angular.forEach($scope.newevent.attrs, function(point, name) {
                newAttrs.push({ "name": name, "points": point });
            });
            var newEvent = {
                name:  $scope.newevent.name,
                parent_name:  $scope.newevent.parent_name.name,
                attrs:  newAttrs
            };
            Auth.addEvent(newEvent)
                .then( function() {
                    // Account created, redirect to home
                    $scope.alerts.push({type: 'success', msg: 'Event successfully added'});
                    $scope.awesomeEvents.push(newEvent);
                })
                .catch( function(err) {
                    err = err.data;
                    $scope.errors = {};

                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function(error, field) {
                        form[field].$setValidity('mongoose', false);
                        $scope.errors[field] = error.message;
                    });
                    $scope.alerts.push({type: 'danger', msg: 'Problem with server request'});
                });
        }
        $scope.submitted = false;
    };
  })
    .directive('onlyDigits', function () {

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return;
                ngModel.$parsers.unshift(function (inputValue) {
                    var digits = inputValue.split('').filter(function (s) { return (!isNaN(s) && s != ' '); }).join('');
                    ngModel.$viewValue = digits;
                    ngModel.$render();
                    return digits;
                });
            }
        };
    });
