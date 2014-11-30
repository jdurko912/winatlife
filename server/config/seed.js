/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Event = require('../api/event/event.model');
var User = require('../api/user/user.model');

Event.find({}).remove(function() {
  Event.create({
    name : 'Personal'
  }, {
    name : 'Professional'
  }, {
    name : 'Academic'
  },  {
    name : 'Spent over an hour at the gym',
    parent_name: 'Personal',
    attrs:  [
        { name:  "str", points:  2 },
        { name:  "dex", points:  1 },
        { name:  "con", points:  1 }
    ]
  },  {
      name : 'Got a promotion',
      parent_name: 'Professional',
      attrs:  [
          { name:  "wis", points:  2 },
          { name:  "cha", points:  1 }
      ]
  },{
      name : 'Got an A on the big project',
      parent_name: 'Academic',
      attrs:  [
          { name:  "int", points:  2 },
          { name:  "wis", points:  3 }
      ]
  });
});

User.find({}).remove(function() {
  User.create({
    provider: 'local',
    login:  'testuser',
    name: 'Test User',
    email: 'test@test.com',
    attrs: [
        { name:  "str", points:  4 },
        { name:  "dex", points:  2 },
        { name:  "con", points:  3 },
        { name:  "int", points:  2 },
        { name:  "wis", points:  4 },
        { name:  "cha", points:  0 }
    ],
    password: 'test'
  }, {
    provider: 'local',
    login:  'admin',
    role: 'admin',
    name: 'Admin',
    email: 'admin@admin.com',
    password: 'admin'
  }, function() {
      console.log('finished populating users');
    }
  );
});