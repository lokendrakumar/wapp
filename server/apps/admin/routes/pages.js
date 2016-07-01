var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

var api = require('api');
var partials = require('apps/admin/partials');

var fn = require('fn');
var view = require('view').prefix('admin');
var categories = require('categories');

var render = fn.views.render;
var toRender = fn.views.toRender;
var renderAll = fn.views.renderAll;
var htmlResponse = fn.views.htmlResponse;

var getModerationQuestion = fn.adminData.getModerationQuestion;
var getOpenquestions = fn.adminData.getOpenquestion;
var getComments = fn.adminData.getComments;
var getVideos = fn.adminData.getVideos;
var getSearch = fn.adminData.getSearch;

var getDubsmashCat = fn.adminData.getDubsmashCat;
var getDubsmashCatAudio = fn.adminData.getDubsmashCatAudio;
var getCategories = fn.adminData.getCategories;
var getTracks = fn.adminData.getTracks;
var deleteTracks = fn.adminData.deleteTracks;
var deleteDubsmashCatAudio = fn.adminData.deleteDubsmashCatAudio;
var usernameFilter = fn.filters.usernameFilter;
var categoryFilter = fn.filters.categoryFilter;
var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;
var username;
var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';

app.get('/', function (req,res){
   
    var args = {
      pagename: 'login',
      title: 'Ask anything on Frankly.me',
      partials: partials.login
    }
   
    
    htmlResponse(req, res, partials.login, args);
   
});
app.get('/moderate/question', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? null : req.query.param;
  getModerationQuestion(offset, param).then(function (data) {
    var args = {
      pagename: 'profile',
      title: 'Ask anything on Frankly.me',
      partials: partials.question,
      feed: data,
      postIndex: data.next_index,
      param : param
    }
    //console.log(args.feed);
    
    htmlResponse(req, res, partials.question, args);
  }); 
});

app.get('/reorder/openQuestion', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  getOpenquestions(offset).then( function (data) {
    console.log(data);
    var args = {
      pagename: 'profile',
      title: 'Ask anything on Frankly.me',
      partials: partials.openQuestion,
      feed: data
    }
    htmlResponse(req, res, partials.openQuestion, args);
  });
});



app.get('/moderate/comments', function (req, res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? null : req.query.param;
  getComments(offset, param).then(function (data) {
    //console.log(data)
    var args = {
      pagename: 'comments',
      title: 'Ask anything on Frankly.me',
      partials: partials.comments,
      feed: data,
      postIndex: data.next_index,
      param : param
    }
    htmlResponse(req, res, partials.comments, args);
  }); 
});

app.get('/moderate/video', function (req,res) {
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? 'time' : req.query.param;
  getVideos(offset, param).then(function (data) {
    var args = {
      pagename: 'answer',
      title: 'Ask anything on Frankly.me',
      partials: partials.videos,
      feed: data,
      postIndex: data.next_index,
      param : param
    }
    htmlResponse(req, res, partials.videos, args);
  }); 
});


app.get('/reorder/karaoke', function (req,res) {
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? null : req.query.param;
  getCategories(offset, param).then(function (data) {
    var args = {
      pagename: 'karaoke',
      title: 'Ask anything on Frankly.me',
      partials: partials.karaoke,
      feed: data,
      postIndex: data.next_index,
      param : param,
      home: true
    }
  htmlResponse(req, res, partials.karaoke, args);
  });
});

app.get('/reorder/dubsmash', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  getDubsmashCat(offset).then(function (data) {
    var args = {
      pagename: 'profile',
      title: 'Ask anything on Frankly.me',
      partials: partials.dubsmash,
      feed: data
    }
    htmlResponse(req, res, partials.dubsmash, args);
  });
});

app.get('/dubsmash/Audio', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var catId = (typeof req.query.catId === 'undefined') ? 0 : req.query.catId;
  var category = (typeof req.query.category === 'undefined') ? 0 : req.query.category;
  getDubsmashCatAudio(catId, offset).then(function (data) {
    var args = {
      pagename: 'profile',
      title: 'Ask anything on Frankly.me',
      partials: partials.dubsmash,
      feed: data,
      category: category,
      category_id: catId
    }
    htmlResponse(req, res, partials.dubsmash, args);
  });
});

app.post('/dubsmash/tracks/delete', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var id = (typeof req.body.song_id === 'undefined') ? null : req.body.song_id;
  var categoryId = (typeof req.body.cat_id === 'undefined') ? null : req.body.cat_id;
  deleteDubsmashCatAudio(id, categoryId).then(function (data) {
    res.send(data);
  });
});


