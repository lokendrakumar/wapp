var Promise = require('bluebird');
var api = require('api');
var _ = require('lodash');
var qs = require('qs');

var view = require('view');
var getUser = require('./data').getUser;
var validatePasswordResetToken = require('./data').validatePasswordResetToken;

var filters = module.exports = {
  /**
   * Filter which resolves user and sets it in req.params
   * from the value of req.params.username. Should sit in
   * front of routes which begin with /:username
   */
  usernameFilter: function (req, res, next) {
    if (_.isUndefined(req.resolved)) req.resolved = {};
    getUser(req.params.username, req.token).then(
      function (data) {
        req.resolved.user = data.user;
        next();
      },
      function (apiRes) {
        if(apiRes.statusCode === 404) {
          res.status(404).render(view('site/pages/404'));
        }
      }
    );
  },

  /**
   *  Filter which resolves category and sets it in req.resolved
   *  from the value of req.params.category. Should sit in front
   *  of routes which begin with /category/:category
   */
  categoryFilter: function (req, res, next) {
    if (_.isUndefined(req.resolved)) req.resolved = {};

    var categories = require('categories');
    for (var i=0;i<categories.listAll().length;i++) {
      var cat = categories.listAll()[i];
      if (cat.slug.toLowerCase() === req.params.category.toLowerCase()) {      
        req.resolved.category = cat;
        next();
        return;
      }
    }

    // if not category us matched
    res.status(404).render(view('site/pages/404'));
  },

  /**
   * Filter to check if user is in session and set
   * X-Token header in api
   */
  authFilter: function(req, res, next) {
    // console.log("authFilter");
    if (!req.isAuthenticated()) {
      if (req.xhr){
        res.status(401).send({msg: 'unauthorized'});
      } else {
        res.status(404).render(view('site/pages/404'));
      }
    } else {
      next();
    }
  },

  /**
   * Filter to check if a user is unauthorized
   * redirects response to /discover
   */
  unauthFilter: function (req, res, next) {
    if (req.isAuthenticated()) {
      var redirectUrl = '/discover';
      var queryStr = qs.stringify(req.query);
      if (queryStr.length > 0) {
        redirectUrl += '?'+queryStr;
      }

      res.redirect(redirectUrl);
    } else {
      next();
    }
  },

  resetPasswordFilter : function (req, res, next) {
    if (_.isUndefined(req.resolved)) req.resolved = {};
    validatePasswordResetToken(req.query.token).then(
      function (data) {
        req.resolved.user = data.user;
        next();
      },
      function (apiRes) {
        res.status(404).render(view('site/pages/404'));
      }
    );
  }
};
