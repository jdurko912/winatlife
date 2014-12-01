'use strict';

var should = require('should');
var app = require('../../app');
var User = require('./user.model');

var user = new User({
  provider: 'local',
  login:  'fakeuser',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password',
  attrs:  [
      { name:  "str", points:  1 },
      { name:  "dex", points:  1 },
      { name:  "con", points:  1 },
      { name:  "int", points:  1 },
      { name:  "wis", points:  1 },
      { name:  "cha", points:  1 }
  ]
});

describe('User Model', function() {
  before(function(done) {
    // Clear users before testing
    User.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    User.remove().exec().then(function() {
      done();
    });
  });

  it('should begin with no users', function(done) {
    User.find({}, function(err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should fail when saving a duplicate user', function(done) {
    user.save(function() {
      var userDup = new User(user);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function(done) {
    user.email = '';
    user.save(function(err) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving without attributes', function(done) {
      user.attr = {};
      user.save(function(err) {
          should.exist(err);
          done();
      });
  });

  it('should fail when saving without a login', function(done) {
      user.login = {};
      user.save(function(err) {
          should.exist(err);
          done();
      });
  })

  it("should authenticate user if password is valid", function() {
    return user.authenticate('password').should.be.true;
  });

  it("should not authenticate user if password is invalid", function() {
    return user.authenticate('blah').should.not.be.true;
  });
});
