'use strict';

angular.module('winatlifeApp')
    .factory('Event', function ($resource) {
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
    });
