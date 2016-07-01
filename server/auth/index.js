var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;

var api = require('api');

var auth = module.exports = function () {
  // serialize and deserialize
  passport.serializeUser(function (user, done) {
    if (user && user.token) {
      done(null, user.token);
    } else {
      done('invalid user', null);
    }
  });
  
  passport.deserializeUser(function (token, done) {
    api.get('/user/profile/me', {
      headers: {
        'X-Token': token
      }
    })
      .then(
      function (data) {
        data.user.token = token;
        done(null, data.user);
      },
      function (res) {
        done(null, null);
      }
    )
  });

  // Custom Stratergy to handle auth for  
  passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
    function (username, password, done) {
      api.post('/login/email', {
        json: {
          device_id: 'web',
          username: username,
          password: password
        }
      })
        .then(
        function (data) {
          console.log(data.user,'pass');
          done(null, data.user);
        },
        function (res) {
          done(null, null, {
            message: 'invalid token'
          });
        }
      );
    }
  ));

  // Custom Stratergy to handle auth for
  passport.use('register', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, username, password, done) {
      api.post('/reg/email', {
        json: {
          device_id: 'web',
          email: username,
          password: password,
          full_name: req.body.fullName
        }
      })
        .then(
        function (data) {
          done(null, data.user);
        },
        function (res) {
          console.log(res,"message");
          done(null, null, {
            message: res
          });
        }
      );
    }
  ));

  // Custom Stratergy to handle auth for
  passport.use('registerPublic', new LocalStrategy({
      usernameField: 'fullName',
      passwordField: 'email',
      passReqToCallback: true
    },
    function (req, fullName, email, done) {
      api.post('/reg/email', {
        json: {
          device_id: 'web',
          email: email,
          full_name: fullName
        }
      })
        .then(
        function (data) {
          done(null, data.user);
        },
        function (res) {
          done(null, null, {
            message: res
          });
        }
      );
    }
  ));


  // Facebook Stratergy to handle social auth from frankly
  passport.use(new FacebookStrategy({
      clientID: '806571129370116',
      clientSecret: 'f5c6e73cd6b2708781fbbb90a0b0489a',
      callbackURL: "https://frankly.me/auth/facebook/callback",
      passReqToCallback: true
    },
    function (request,accessToken, refreshToken, profile, done) {
      if(request.isAuthenticated()){
        api.post('/user/update_token/facebook',{
          token: request.token,
          json:{
            access_token: accessToken,   
            social_id : profile.id
          }
        })
        .then(
            function (data) {
              //user.token is required in serializeUser
              var user = {"token":request.session.passport.user};
              done(null,user);
            },
            function (res) {
              done('invalid Token', null);
            }
          );
      }
        else{
            api.post('/login/social/facebook', {
            json: {
              device_id: 'web',
              external_access_token: accessToken,
              social_user_id: profile.id
            }
          })
            .then(
            function (data) {
              done(null, data.user);
            },
            function (res) {
              done('invalid Token', null);
            }
          );
        }
       
    }
  ));

  // Twitter Stratergy to handle /login/social/facebook
  passport.use(new TwitterStrategy({
      consumerKey: 'aaNDJcxdHadQTxBW8P7B42yoy',
      consumerSecret: 'AAOwvDBHlci4WmJANTmgOLJg28v3HSx0SogBEfQY9TGamsF9CS',
      callbackURL: "https://frankly.me/auth/twitter/callback",
      passReqToCallback: true

    },
    function (request,token, tokenSecret, profile, done) {
      if(request.isAuthenticated()){
        api.post('/user/update_token/twitter',{
        token: request.token,
          json:{
            access_token: token,   
            access_secret: tokenSecret,
            social_id : profile.id
          }
        })
        .then(
            function (data) {
              //user.token is required in serializeUser
              var user = {"token":request.session.passport.user};
              // console.log("userObject",request.session,"userObject1",user);
              done(null,user);
            },
            function (res) {
              done('invalid Token', null);
            }
          );
      }
      else{
        api.post('/login/social/twitter', {
          json: {
            device_id: 'web',
            external_access_token: token,
            external_token_secret: tokenSecret,
            social_user_id: profile.id
          }
        })
          .then(
          function (data) {
            done(null, data.user);
          },
          function (res) {
            console.log(res);
            done('invalid Token', null);
          }
        );
      }
    }
  ));

/*

345381322113-gisgldrjke8829rtuh4sptec2hdqekhn.apps.googleusercontent.com
Client secret 
ug5XEAnnQ4Q3bsa0Tv87I7tV
Redirect URIs 
https://frankly.me/auth/success
JavaScript origins  
http://frankly.me
*/

  // Google Oauth 2.0 Stratergy to handle /login/social/google
  passport.use(new GoogleStrategy({
      clientID: '345381322113-gisgldrjke8829rtuh4sptec2hdqekhn.apps.googleusercontent.com',//'642769677965-nqatc5gl7qkpagti1nr27q5tmpcjavav.apps.googleusercontent.com',
      clientSecret: 'ug5XEAnnQ4Q3bsa0Tv87I7tV',//'nYZfdRYKkNJFUAXdODAu2k2H',
      callbackURL: "https://frankly.me/auth/google/return",//"http://frankly.me/auth/google/return",
      passReqToCallback: true
    },
    function (request, accessToken, refreshToken, profile, done) {
      api.post('/login/social/google', {
        token: request.token,
        json: {
          device_id: 'web',
          external_access_token: accessToken,
          social_user_id: profile.id
        }
      })
        .then(
        function (data) {
          done(null, data.user);
        },
        function (res) {
          done('invalid Token', null);
        }
      );
    }
  ));
};