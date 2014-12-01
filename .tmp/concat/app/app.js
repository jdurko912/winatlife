'use strict';

angular.module('winatlifeApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap'
])
  .config(["$routeProvider", "$locationProvider", "$httpProvider", function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/login'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  }])

  .factory('authInterceptor', ["$rootScope", "$q", "$cookieStore", "$location", function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  }])

  .run(["$rootScope", "$location", "Auth", function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  }]);
'use strict';

angular.module('winatlifeApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  }]);
'use strict';

angular.module('winatlifeApp')
  .controller('LoginCtrl', ["$scope", "Auth", "$location", "$window", function ($scope, Auth, $location, $window) {
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
  }]);

'use strict';

angular.module('winatlifeApp')
  .controller('SettingsCtrl', ["$scope", "User", "Auth", function ($scope, User, Auth) {
    $scope.errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
		};
  }]);

'use strict';

angular.module('winatlifeApp')
  .controller('SignupCtrl', ["$scope", "Auth", "$location", "$window", function ($scope, Auth, $location, $window) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
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
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  }]);

'use strict';

angular.module('winatlifeApp')
  .controller('AdminCtrl', ["$scope", "$http", "Auth", "User", "Event", function ($scope, $http, Auth, User, Event) {

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
  }])
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

'use strict';

angular.module('winatlifeApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  }]);
'use strict';

angular.module('winatlifeApp')
    .controller('MainCtrl', ["$scope", "$http", "Auth", function ($scope, $http, Auth) {
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
  }])
  .filter('titleCase', function() {
    return function (input) {
      input = input || '';
      return input.replace(/\w\S*/g, function (txt) {
         return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };
  });

'use strict';

angular.module('winatlifeApp')
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when('/user/:userId', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        authenticate:  true
      });
  }]);
'use strict';

angular.module('winatlifeApp')
  .factory('Modal', ["$rootScope", "$modal", function ($rootScope, $modal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $modal.open() returns
     */
    function openModal(scope, modalClass) {
      var modalScope = $rootScope.$new();
      scope = scope || {};
      modalClass = modalClass || 'modal-default';

      angular.extend(modalScope, scope);

      return $modal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {

        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete: function(del) {
          del = del || angular.noop;

          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed staight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name + '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        }
      }
    };
  }]);

'use strict';

angular.module('winatlifeApp')
  .factory('Auth', ["$location", "$rootScope", "$http", "User", "$cookieStore", "$q", "Event", function Auth($location, $rootScope, $http, User, $cookieStore, $q, Event) {
    var currentUser = {};
    if($cookieStore.get('token')) {
      currentUser = User.get();
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        $http.post('/auth/local', {
          login:  user.login,
          email: user.email,
          password: user.password
        }).
        success(function(data) {
          $cookieStore.put('token', data.token);
          currentUser = User.get();
          deferred.resolve(data);
          return cb();
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        return User.save(user,
          function(data) {
            $cookieStore.put('token', data.token);
            currentUser = User.get();
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          oldPassword: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

        /**
         * Update Attributes
         *
         * @param  {Array of { name:  value }}   newattrs
         * @param  {Function} callback    - optional
         * @return {Promise}
         */
        updateAttributes: function(newattrs, callback) {
            var cb = callback || angular.noop;

            return User.updateAttributes({ id: currentUser._id }, {
                newAttributes:  JSON.stringify(newattrs)
            }, function(user) {
                return cb(user);
            }, function(err) {
                return cb(err);
            }).$promise;
        },

        /**
         * Delete Event
         *
         * @param  Event object
         * @param  {Function} callback    - optional
         * @return {Promise}
         */
        deleteEvent: function(event, callback) {
            var cb = callback || angular.noop;

            return Event.deleteEvent({ id: event._id }, {
                user:  JSON.stringify(currentUser)
            }, function(event) {
                return cb(event);
            }, function(err) {
                return cb(err);
            }).$promise;
        },

        /**
         * Create a New Event
         *
         * @param  Event object
         * @param  {Function} callback    - optional
         * @return {Promise}
         */
        addEvent: function(event, callback) {
            var cb = callback || angular.noop;

            return Event.addEvent({ id: '' }, {
                name:  event.name,
                parent_name:  event.parent_name,
                attrs:  JSON.stringify(event.attrs)
            }, function (event) {
                return cb(event);
            }, function(err) {
                return cb(err);
            }).$promise;
        },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
        return currentUser;
      },

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
        return currentUser.role === 'admin';
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      }
    };
  }]);

'use strict';

angular.module('winatlifeApp')
    .factory('Event', ["$resource", function ($resource) {
        return $resource('/api/events/:id', {
                id: '@_id'
            },
            {
                addEvent: {
                    method: 'POST'
                },
                deleteEvent: {
                    method:  'DELETE'
                },
                get: {
                    method: 'GET'
                }
            });
    }]);

'use strict';

angular.module('winatlifeApp')
  .factory('User', ["$resource", function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      updateAttributes: {
        method:  'PUT',
        params: {
          controller: 'attributes'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      }
	  });
  }]);

'use strict';

/**
 * Removes server error when user updates input
 */
angular.module('winatlifeApp')
  .directive('mongooseError', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        element.on('keydown', function() {
          return ngModel.$setValidity('mongoose', true);
        });
      }
    };
  });
'use strict';

angular.module('winatlifeApp')
  .controller('NavbarCtrl', ["$scope", "$location", "Auth", function ($scope, $location, Auth) {

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.menu = [{
        'title': 'Home',
        'link': '/user/'.concat($scope.getCurrentUser().login)
    }];

    $scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  }]);
angular.module('winatlifeApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/account/login/login.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Login</h1></div><div class=col-sm-12><form class=form name=form ng-submit=login(form) novalidate><div class=form-group><label>Username</label><input type=login name=login class=form-control ng-model=user.login required></div><div class=form-group><label>Password</label><input type=password name=password class=form-control ng-model=user.password required></div><div class=\"form-group has-error\"><p class=help-block ng-show=\"form.login.$error.required && form.password.$error.required && submitted\">Please enter your login and password.</p><p class=help-block ng-show=\"form.login.$error.login && submitted\">Please enter a valid login; it must be between 3 and 16 characters with only letters, numbers, underscores and hyphens</p><p class=help-block>{{ errors.other }}</p></div><div><button class=\"btn btn-inverse btn-lg btn-login\" type=submit>Login</button> <a class=\"btn btn-default btn-lg btn-register\" href=/signup>Register</a></div><hr><div><a class=\"btn btn-facebook\" href=\"\" ng-click=\"loginOauth('facebook')\"><i class=\"fa fa-facebook\"></i> Connect with Facebook</a></div></form></div></div><hr></div>"
  );


  $templateCache.put('app/account/settings/settings.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form class=form name=form ng-submit=changePassword(form) novalidate><div class=form-group><label>Current Password</label><input type=password name=password class=form-control ng-model=user.oldPassword mongoose-error><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword class=form-control ng-model=user.newPassword ng-minlength=3 required><p class=help-block ng-show=\"(form.newPassword.$error.minlength || form.newPassword.$error.required) && (form.newPassword.$dirty || submitted)\">Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button class=\"btn btn-lg btn-primary\" type=submit>Save changes</button></form></div></div></div>"
  );


  $templateCache.put('app/account/signup/signup.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=container><div class=row><div class=col-sm-12><h1>Sign up</h1></div><div class=col-sm-12><form class=form name=form ng-submit=register(form) novalidate><div class=form-group ng-class=\"{ 'has-success': form.name.$valid && submitted,\n" +
    "                                            'has-error': form.name.$invalid && submitted }\"><label>Name</label><input name=name class=form-control ng-model=user.name required><p class=help-block ng-show=\"form.name.$error.required && submitted\">A name is required</p></div><div class=form-group ng-class=\"{ 'has-success': form.login.$valid && submitted,\n" +
    "                                        'has-error': form.login.$invalid && submitted }\"><label>Login</label><input name=login class=form-control ng-model=user.login required><p class=help-block ng-show=\"form.login.$error.required && submitted\">A login is required and must be between 3 to 16 characters containing only letters, numbers, underscores and/or hyphens.</p></div><div class=form-group ng-class=\"{ 'has-success': form.email.$valid && submitted,\n" +
    "                                            'has-error': form.email.$invalid && submitted }\"><label>Email</label><input type=email name=email class=form-control ng-model=user.email required mongoose-error><p class=help-block ng-show=\"form.email.$error.email && submitted\">Doesn't look like a valid email.</p><p class=help-block ng-show=\"form.email.$error.required && submitted\">What's your email address?</p><p class=help-block ng-show=form.email.$error.mongoose>{{ errors.email }}</p></div><div class=form-group ng-class=\"{ 'has-success': form.password.$valid && submitted,\n" +
    "                                            'has-error': form.password.$invalid && submitted }\"><label>Password</label><input type=password name=password class=form-control ng-model=user.password ng-minlength=3 required mongoose-error><p class=help-block ng-show=\"(form.password.$error.minlength || form.password.$error.required) && submitted\">Password must be at least 3 characters.</p><p class=help-block ng-show=form.password.$error.mongoose>{{ errors.password }}</p></div><div><button class=\"btn btn-inverse btn-lg btn-login\" type=submit>Sign up</button> <a class=\"btn btn-default btn-lg btn-register\" href=/login>Login</a></div><hr><div><a class=\"btn btn-facebook\" href=\"\" ng-click=\"loginOauth('facebook')\"><i class=\"fa fa-facebook\"></i> Connect with Facebook</a></div></form></div></div><hr></div>"
  );


  $templateCache.put('app/admin/admin.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><div class=\"panel panel-xs\"><alert ng-repeat=\"alert in alerts\" type={{alert.type}} close=closeAlert($index)>{{alert.msg}}</alert></div><div class=container><h2>User Deletion</h2><ul class=list-group><li class=list-group-item ng-repeat=\"user in users\"><strong>{{user.name}}</strong><br><span class=text-muted>{{user.login}}</span> <a ng-click=deleteUser(user) class=trash><span class=\"glyphicon glyphicon-trash pull-right\"></span></a></li></ul></div><div class=container><h2>Add Event</h2><form class=form name=form ng-submit=addEvent(form) novalidate><div class=form-group ng-class=\"{ 'has-success': form.name.$valid && submitted,\n" +
    "                                            'has-error': form.name.$invalid && submitted }\"><label>Description</label><input name=name class=form-control ng-model=newevent.name required><p class=help-block ng-show=\"form.name.$error.required && submitted\">A description is required</p></div><div class=form-inline ng-class=\"{ 'has-success': form.attrs.$valid && submitted,\n" +
    "                                            'has-error': form.attrs.$invalid && submitted }\"><label>Attributes</label><br><input onlydigits size=9 ng-model=newevent.attrs.str class=form-control placeholder=Strength> <input onlydigits size=9 ng-model=newevent.attrs.dex class=form-control placeholder=Dexterity> <input onlydigits size=9 ng-model=newevent.attrs.con class=form-control placeholder=Constitution> <input onlydigits size=9 ng-model=newevent.attrs.int class=form-control placeholder=Intelligence> <input onlydigits size=9 ng-model=newevent.attrs.wis class=form-control placeholder=Wisdom> <input onlydigits size=9 ng-model=newevent.attrs.cha class=form-control placeholder=Charisma><p class=help-block ng-show=\"form.attrs.$error.required && submitted\">Doesn't look like a valid email.</p></div><br><div class=form-group ng-class=\"{ 'has-success': form.parent_name.$valid && submitted,\n" +
    "                                            'has-error': form.parent_name.$invalid && submitted }\"><select class=\"form-control dropdown-toggle\" ng-options=\"event.name for event in awesomeEvents | filter:{parent_name:'!'}\" ng-model=newevent.parent_name><option value>-- Select a Category --</option></select><p class=help-block ng-show=\"form.parent_name.$error.required && submitted\">Event must have a category</p></div><br><div><button class=\"btn btn-primary\" type=submit ng-disabled=!form.$valid>Add</button></div></form></div><div class=container><h2>Remove Events</h2><ul class=list-group><li class=list-group-item ng-repeat=\"event in awesomeEvents | filter:{parent_name:'!!'}\"><strong>{{event.name}}</strong><br><ul class=list-inline><li ng-repeat=\"attr in event.attrs\"><span class=text-muted>+{{attr.points}} to {{attr.name}}</span></li></ul><a ng-click=deleteEvent(event) class=trash><span class=\"glyphicon glyphicon-trash pull-right\"></span></a></li></ul></div>"
  );


  $templateCache.put('app/main/main.html',
    "<div ng-include=\"'components/navbar/navbar.html'\"></div><header class=hero-unit id=banner><h1 class=page-header>Attributes</h1><div class=container-fluid><div><ul class=list-unstyled><li><img src=assets/images/str.png alt=Strength width=50 title=Strength> <span style=font-size:30px>{{getAttr('str') || 0}}</span></li><li><img src=assets/images/dex.png alt=Dexterity width=50 title=Dexterity> <span style=font-size:30px>{{getAttr('dex') || 0}}</span></li><li><img src=assets/images/con.png alt=Constitution width=50 title=Constitution> <span style=font-size:30px>{{getAttr('con') || 0}}</span></li><li><img src=assets/images/int.png alt=Intelligence width=50 title=Intelligence> <span style=font-size:30px>{{getAttr('int') || 0}}</span></li><li><img src=assets/images/wis.png alt=Wisdom width=50 title=Wisdom> <span style=font-size:30px>{{getAttr('wis') || 0}}</span></li><li><img src=assets/images/cha.png alt=Charisma width=50 title=Charisma> <span style=font-size:30px>{{getAttr('cha') || 0}}</span></li></ul></div></div></header><div class=container><div class=row><div class=col-lg-12><h1 class=page-header>Log</h1><accordion close-others=true><accordion-group ng-repeat=\"parent in awesomeEvents | filter:{parent_name:'!'}\" heading=\"{{parent.name | titleCase}}\"><div ng-repeat=\"child in awesomeEvents | filter:{parent_name:parent.name}\" class=accordion-inner><a href=\"\" ng-click=updateAttr(child.attrs)>{{child.name | titleCase}}</a></div></accordion-group></accordion></div></div></div><footer class=footer><div class=container><p>Created using Angular Fullstack v2.0.13</p></div></footer>"
  );


  $templateCache.put('app/modal/modal.html',
    "<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat=\"button in modal.buttons\" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>"
  );


  $templateCache.put('components/navbar/navbar.html',
    "<div class=\"navbar navbar-default navbar-static-top\" ng-controller=NavbarCtrl><div class=container><div class=navbar-header><button class=navbar-toggle type=button ng-click=\"isCollapsed = !isCollapsed\"><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a href=\"/\" class=navbar-brand>winatlife</a></div><div collapse=isCollapsed class=\"navbar-collapse collapse\" id=navbar-main><ul class=\"nav navbar-nav\"><li ng-repeat=\"item in menu\" ng-class=\"{active: isActive(item.link)}\"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class=\"{active: isActive('/admin')}\"><a href=/admin>Admin</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/signup')}\"><a href=/signup>Sign up</a></li><li ng-hide=isLoggedIn() ng-class=\"{active: isActive('/login')}\"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text>Hello {{ getCurrentUser().name }}</p></li><li ng-show=isLoggedIn() ng-class=\"{active: isActive('/settings')}\"><a href=/settings><span class=\"glyphicon glyphicon-cog\"></span></a></li><li ng-show=isLoggedIn() ng-class=\"{active: isActive('/logout')}\"><a href=\"\" ng-click=logout()>Logout</a></li></ul></div></div></div>"
  );

}]);

