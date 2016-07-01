var app = module.exports = require('express')();
var _ = require('lodash');

var fn = require('fn');
var view = require('view').prefix('site');
var sitePages = require('apps/site/pages');
var partials = require('apps/newsite/partials');


var render = fn.views.render;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var getPostById = fn.data.getPostById;
var getQuestion = fn.data.getQuestion;
var getUser = fn.data.getUser;
var getBlog = fn.data.getBlog;


var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;

/**
 * user post page legacy support
 */
app.get('/:username/blog', function (req, res) {
  var offset = req.query.postIndex === undefined ? 0 : parseInt(req.query.postIndex);
  getUser(req.params.username,req.token).then( function(data){
    getBlog(data.user.id , offset).then( function(blogs){
      var args = {
        title: "@" + req.params.username + " blog",
        pagename: 'blog',
        blogs: blogs,
        profile: data.user,
        partials: partials.blogs,
        user: data.user,
        postIndex: blogs.next_index
      };
      htmlResponse(req, res, partials.blogs, args);
      
    });
  });
});
