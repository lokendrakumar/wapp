
var app = module.exports = require('express')();
var _ = require('lodash');

var view = require('view').prefix('site');
var fn = require('fn');
var api = require('api');
var pages = require('apps/widgets/partials');


app.post('/user/exists', function (req, res) {
  api.post('/user/exists', {
    json: {email: req.body.email}
  }).then(
    function (data) {
      res.send(data);
    },
    function () {
      res.status(500).send({msg: 'something went wrong'});
    }
  );
});

/**
 *  Logout endpoint for session
 */
app.post('/logout', function (req, res) {
  req.logout();
  res.send({msg: 'Logged out'});
});

