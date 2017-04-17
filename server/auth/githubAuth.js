var githubAuth = require('./githubAuthConfig.js');
var passport = require('passport');
var GithubStrategy = require('passport-github2').Strategy;
var usersCtrl = require('./../db/users/usersController.js');
var User = require('./../db/users/usersModel.js');

var app = require('./../app.js');
var githubCB;

if ( app.get('env') === 'development' ) {
  githubCB = "http://localhost:8080/auth/github/callback"
} else {
  githubCB = "https://hackeroos.herokuapp.com/auth/github/callback"
}

passport.use(new GithubStrategy({
    clientID: githubAuth.CLIENT_ID,
    clientSecret: githubAuth.CLIENT_SECRET,
    callbackURL: githubCB
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('inside passport: profile=', profile);
    var email;
    if (profile.emails) {
      email = profile.emails[0].value;
    } else {
      email = 'hackerooxyz@gmail.com' //if the user doesn't have a github email...
    }
    var user = {
      name: profile.displayName, 
      email: email, 
      profile_img: profile._json.avatar_url, 
      github_id: profile.id
    };
    
    User.findOne({
      where: {
        github_id: user.github_id
      }
    }).then( function(userFound) {
      if (!userFound) {
        console.log('user does not exist');
        console.log(user);
        usersCtrl.save(user);
      } else {
        console.log('user exists');
      }
      return done(null, user);
    }).catch(function(err) {
      console.log('there was an error retrieving the user:', err);
    });
  }
));

passport.serializeUser(function(user, done) {
  // null is for errors
  done(null, user.github_id);
});

passport.deserializeUser(function(github_id, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  User.findOne({
    where: {
      github_id: github_id
    }
  }).then(function(userFound) {
    if (userFound) {
      done(null, userFound);
    }
  }).catch(function(err) {
    console.log('there was an error: ', err);
    done(err);
  });
});

var githubAuth = {
  authenticate: function(req, res, next) {
    if (req.session.passport) {
      console.log('there is a session, retrieving user:');
      usersCtrl.retrieve(req, res, next);
    } else {
      res.send('User is not authenticated');
    }
  },

  failureRedirect: passport.authenticate('github', { failureRedirect: '/' }),

  successCallback: function(req, res, next) {
    res.redirect('/dashboard');
  }
};

module.exports = githubAuth;


