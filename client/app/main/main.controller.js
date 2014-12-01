'use strict';

angular.module('winatlifeApp')
    .controller('MainCtrl', function ($scope, $http, Auth) {
    $scope.awesomeEvents = [];
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.user = $scope.getCurrentUser();

    $http.get('/api/events').success(function(awesomeEvents) {
      $scope.awesomeEvents = awesomeEvents;
    });

    $scope.getChildren = function(parent_name) {
      return $scope.awesomeEvents.filter(function(entry) {
        return entry.parent_name === parent_name;
      })[0];
    };

    $scope.getAttr = function(name) {
        if (typeof $scope.user.attrs === "undefined") return 0;
        var attr = $scope.user.attrs.filter(function(entry) {
            return entry.name === name;
        })[0];
        if (typeof attr === "undefined") return 0;
        else return attr.points;
    };

    $scope.updateAttr = function(newattr) {
        var indexOfAttr = 0;
        angular.forEach(newattr, function( attr ){
          indexOfAttr = -1;
          _.each($scope.user.attrs, function (data, index){
             if (data.name === attr.name) {
                 indexOfAttr = index;
                 return;
             }
          });
          if (indexOfAttr === -1) $scope.user.attrs.push(attr);
          else $scope.user.attrs[indexOfAttr].points += attr.points;
        });
        Auth.updateAttributes($scope.user.attrs);
    };

    $scope.addEvent = function() {
      if($scope.newEvent === '') {
        return;
      }
      $http.post('/api/events', { name: $scope.newEvent });
      $scope.newEvent = '';
    };

    $scope.deleteEvent = function(event) {
      $http.delete('/api/events/' + event._id);
    };
  })
  .filter('titleCase', function() {
    return function (input) {
      input = input || '';
      return input.replace(/\w\S*/g, function (txt) {
         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
  });
