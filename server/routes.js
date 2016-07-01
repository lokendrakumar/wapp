/*
var app = module.exports = require('express')();

app.use('/', require('site'));
*/

var _ = require('lodash');
var view = require('view');
var UAParser = require('ua-parser-js');

var app = module.exports = require('express')();

// load routes after categories have been cached
require('categories').load(function (err) {
  if (err) {
    throw err;
  }

  /**
   * setup auth
   */
  require('auth')();

  /**
   * extract ua-data, and set it on req and res.locals
   */
  app.use(function (req, res, next) {
    var uaData = (new UAParser).setUA(req.get('user-agent')).getResult();
    req.uaData = res.locals.uaData = uaData;
    next();
  });

  /**
   * some generic helpers for views
   */
  app.use(function (req, res, next) {
    res.locals._ = _;
    res.locals.view = view;

    res.locals.componentId = function (type, modelId, index) {
      var randStr = function (length) {
        length = _.isUndefined(length) ? 5 : length;
        return Math.random().toString().slice(2, 2 + length);
      };
      modelId = _.isUndefined(modelId) ? '' : modelId;
      index = _.isUndefined(index) ? '' : index;

      var path = req.path.slice(1).replace(/\//g, '-').replace(/\./g, '-').replace(/#/, '-');

      return [path, type, modelId, index, randStr()].join('');
    };

    res.locals.genUrl = function (link) {
      if(link)
      {
        var index = link.indexOf('http');
        if (index === 0) {
          return link;
        } else {
          // replacing req.get('host') with frankly.me
          // because req.get('host') on production sets link to node2.staging.frankly.me
          // added conditional response to handle localhost and node.staging
          var hostName = req.get('host');
          hostName = Math.max(hostName.indexOf('localhost'), hostName.indexOf('node.staging'), hostName.indexOf('alpha')) > -1 ? hostName : 'frankly.me';
          var proto = Math.max(hostName.indexOf('localhost'), hostName.indexOf('node.staging'), hostName.indexOf('alpha')) > -1 ? 'http' : 'https';
          return [req.protocol, '://', hostName, '/', link].join('');
        }
      }
    };

    next();
  });

  /**
   * set auth related req params and view-vars
   */
    
  app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
      if (req.user === null) {
        req.token = null;
        req.locals.me = null;
        req.logout();
      } else {
        res.locals.me = req.user;
        req.token = req.user.token;
        next();

      }
    } else {
      req.token = null;
      res.locals.me = null;
      next();
    }
  });

  /**
   * Now that all the necessary middlewares are in place,
   * mount various apps
   */
  require('apps').forEach(function (a) {
    app.use(a.prefix, a.app);
  });

  console.log('routes mounted');
});
