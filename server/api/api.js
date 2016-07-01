var request = require('request');
var config = require('config');
var Promise = require('bluebird');
var _ = require('lodash');
var log = require('metalogger')();

var redis = require('redis');
var client = redis.createClient();
var cacheTime = 1000*60*60*24; //cache time 1 days in milliseconds

client.set("apiList",
  ["/list/feed"]
);

var apiFactory = module.exports = function () {

  var checkAPI = function (translator){
    client.get("apiList", function (err, reply){
      if(!err){
//        return reply.indexOf(translator);
        return -1;
      }
      else{
        return -1;
      }
    });
  };


  // wrap up request in a bluebird promise with some default
  // options to create the base api function

  // hold accessToken if user Logged In 
  var accessToken = null;

  var api = function (method, url, options) {
    // instantiate options as an empty object literal
    
    options = _.isUndefined(options) ? {} : options;

    //var token = options.headers && options.headers['X-Token'] ? options.headers['X-token'] : accessToken;
    var token = options.token;
    var widget = options.widget;

    var header = url.indexOf('http') === 0 ? {} : {'X-DeviceID': 'web', 'X-Token': token};
    if (widget) {
      header = url.indexOf('http') === 0 ? {} : {'X-DeviceID': 'web', 'X-Token': token, 'X-widget-id': 'widget'};
    }
    
    _.merge(
      options,
      {

        // set the http request method
        method: method,
        // if the url starts with 'http', leave it be, otherwise
        // prefix api_base to the url
        uri: url.indexOf('http') === 0 ? url : config.app.apiBase + url,
        // if the url starts with http, leave headers be
        // other wise attach X-DeviceID: web header
        headers: header,
        json: options.json ? options.json : true
      }
    );
    // send json data under the key 'json' as object literal

    // send query parameters under the key 'qs' as object literal

    // send application/x-www-form-urlencoded data under the key 'form' as object literal

    // send multipart/form-data under the key 'formData' as a formData object

    return new Promise(function (resolve, reject) {
      request(options, function (err, res, body) {
        if (err) {
          throw err;
        } else {
          if (res.statusCode === 200 || res.statusCode === 302) {
            if (res.body.redirect === true) {
              resolve(res.body);
              return;
            }

            // first check all translators
            for (var i = 0; i < api.translators.length; i++) {
              var translator = api.translators[i];
              if (translator.test(method, url, options)) {
                var data = "";
                if(checkAPI(url) >= -1 && checkAPI(url) !== undefined){
                  client.exists(url, function (err, reply){
                    if (reply === 1){
                      client.get(url, function (error, value){
                        data = value;
                      });
                    }
                    else{
                      data = translator.translate(res.body);
                      client.set(url, data);
                      client.expire(url, cacheTime);
                    }
                  })
                }
                else {
                  data = translator.translate(res.body);
                }
                resolve(data);
                return;
              }
            }
            // otherwise resolve body just like that
            resolve(res.body);

          } else {
            console.log(res,'err');
            log.info('Api error: \n' + JSON.stringify({
                url: url, body: body, options: options
              }, null, 2));
            reject(res);
          }
        }
      });
    });
  };

  // response translators
  api.translators = [];

  // method to set accessToken for loggedIn user
  api.setToken = function (token) {
    accessToken = token;
  };

  // method to add a translator
  api.translator = function (translator) {
    if (_.isUndefined(translator.test)) {
      translator.test = function (method, url, options) {
        return method === this.method && this.pattern.test(url)
      };
    }

    api.translators.push(translator);
    return this;
  };

  // attach shorthands for get, put, post, delete to api
  ['GET', 'PUT', 'POST', 'DELETE'].forEach(function (m) {
    api[m.toLowerCase()] = function (url, options) {
      return api(m, url, options);
    };
  });

  return api;
};