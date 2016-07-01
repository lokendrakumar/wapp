var app = module.exports = require('express')();
var _ = require('lodash');
var Promise = require('bluebird');
var passport = require('passport');

var fs = require('fs');
var config = require('config');

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
var postReorder = fn.adminData.postReorder;

var getDubsmashCat = fn.adminData.getDubsmashCat;
var getDubsmashCatAudio = fn.adminData.getDubsmashCatAudio;
var getCategories = fn.adminData.getCategories;
var getTracks = fn.adminData.getTracks;
var deleteTracks = fn.adminData.deleteTracks;
var usernameFilter = fn.filters.usernameFilter;
var categoryFilter = fn.filters.categoryFilter;
var authFilter = fn.filters.authFilter;
var unauthFilter = fn.filters.unauthFilter;
var username;
var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';

app.post('/moderate/question/CRUD', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.body.param === 'undefined') ? null : req.body.param;
  var question_id = (typeof req.body.id === 'undefined') ? null : req.body.id;
  var body = (typeof req.body.body === 'undefined') ? null : req.body.body;
  if(param === 'edit/approve'){
    api.post('/admin/question/edit',{
      json: {
        question_id: question_id,
        body: body
      },
      token: token,
    }).then(function(status){
      if(status){
        api.post('/admin/question/mark_reviewed', {
          json: {
            question_id: question_id,
          },
          token: token,
        }).then(function (data){
          console.log(data);
          res.send(data);
        });
      }
    });
  } else if ( param === 'approve' ){
    api.post('/admin/question/mark_reviewed', {
      json: {
        question_id: question_id,
      },
      token: token,
    }).then(function (data){
      console.log(data);
      res.send(data);
    });
  } else if( param === 'delete' ){
    api.post('/admin/question/delete', {
      json: {
        question_id: question_id,
      },
      token: token,
    }).then(function (data){
      console.log(data);
      res.send(data);
    });
  }
});

app.post('/moderate/comment/CRUD', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.body.param === 'undefined') ? null : req.body.param;
  var comment_id = (typeof req.body.id === 'undefined') ? null : req.body.id;
  var body = (typeof req.body.body === 'undefined') ? null : req.body.body;
  if(param === 'edit/approve'){
    api.post('/admin/moderateprofiles/edit_comment',{
      json: {
        comment_id: comment_id,
        body: body
      },
      token: token,
    }).then(function(status){
      if(status){
        api.post('/admin/moderateprofiles/mark_reviewed_comment', {
          json: {
            comment_id: comment_id,
          },
          token: token,
        }).then(function (data){
          res.send(data);
        });
      }
    });
  } else if ( param === 'approve' ){
    api.post('/admin/moderateprofiles/mark_reviewed_comment', {
      json: {
        comment_id: comment_id,
      },
      token: token,
    }).then(function (data){
      res.send(data);
    });
  } else if( param === 'delete' ){
    api.post('/admin/moderateprofiles/deletecomment', {
      json: {
        comment_id: comment_id,
      },
      token: token,
    }).then(function (data){
      res.send(data);
    });
  }
});

app.post('/moderate/video/CRUD', function (req,res) {
  console.log('lok')
  console.log(req.body)
  //var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var moderationType = (typeof req.body.moderation_type === 'undefined') ? null : req.body.moderation_type;
  var answer_id = (typeof req.body.id === 'undefined') ? null : req.body.id;
  if(moderationType === 'approve'){
    api.post('/admin/post/edit',{
      json: {
        post_id: answer_id,
        moderation_type:'approved'
      },
      token: token,
    }).then(function(data){
        res.send(data);
    });
  } 
  else if(moderationType === 'delete') {
    api.post('/admin/post/delete',{
      json: {
        post_id: answer_id
      },
      token: token,
    }).then(function(data){
        res.send(data);
    });
  }
});



app.get('/reorder/tracks', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? null : req.query.param;
  var id = (typeof req.query.id === 'undefined') ? null : req.query.id;
  var categoryName = (typeof req.query.cat_name === 'undefined') ? null : req.query.cat_name;
  getTracks(offset, id).then(function (data) {
    var args = {
      pagename: 'karaoke',
      title: 'Ask anything on Frankly.me',
      partials: partials.karaoke,
      feed: data,
      postIndex: data.next_index,
      param : param,
      category: categoryName,
      category_id: data.category_id
    }
    htmlResponse(req, res, partials.karaoke, args);
  });
});

app.get('/search/Audio', function (req,res) {
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var string = (typeof req.query.string === 'undefined') ? 0 : req.query.string;
  var feature = (typeof req.query.feature === 'undefined') ? 0 : req.query.feature;
  getSearch(string, feature, offset).then(function (data) {
    res.send(data);
  });
});

app.delete('/karaoke/tracks/delete', function (req,res){
  var offset = (typeof req.query.postIndex === 'undefined') ? 0 : req.query.postIndex;
  var param = (typeof req.query.param === 'undefined') ? null : req.query.param;
  var id = (typeof req.body.song_id === 'undefined') ? null : req.body.song_id;
  var categoryName = (typeof req.query.cat_name === 'undefined') ? null : req.query.cat_name;
  var categoryId = (typeof req.body.cat_id === 'undefined') ? null : req.body.cat_id;
  deleteTracks(offset, id, categoryId).then(function (data) {
    res.send(data);
  });
});

app.post('/karaoke/addTrack', function(req, res) {

  api.post('/admin/karaoke/tracks', {
    formData: {
      karaoke_file: fs.createReadStream(config.app.uploadsDir + '/' + req.files.karaoke_file.name),
      voice_file: fs.createReadStream(config.app.uploadsDir + '/' + req.files.voice_file.name),
      parent_category_id:req.body.parent_category_id,
      display_name:req.body.display_name,
      twitter_handle:(typeof req.query.twitter_handle === 'undefined') ? '' : req.body.twitter_handle
    },
    token: token,
  }).then(function (data){
    //console.log(data)
    res.send(data);
  });

});

app.post('/karaoke/addCategory', function(req, res) {

  api.post('/admin/karaoke/categories', {
    formData: {
      icon_image: req.files.icon_image === 'undefined'? '' :fs.createReadStream(config.app.uploadsDir + '/' + req.files.icon_image.name),
      display_name: req.body.display_name,
      twitter_handle: (typeof req.body.twitter_handle === 'undefined') ? '' : req.body.twitter_handle,
      show_on_top: req.body.show_on_top,
    },
    token: token,
  }).then(function (data){
    //console.log(data)
    res.send(data);
  });

});

app.post('/karaoke/deleteCategory', function(req, res) {

  api.delete('/admin/karaoke/categories/' +req.body.categoryId, {
    formData: {
      deleted:'1',
    },
    token: token,
  }).then(function (data){
    res.send(data);
  });

});

app.post('/reorder', function (req,res){
  var catId = (typeof req.body.catId === 'undefined') ? 0 : req.body.catId;
  var prev_id = (typeof req.body.prev_id === 'undefined') ? 0 : req.body.prev_id;
  var next_id = (typeof req.body.next_id === 'undefined') ? 0 : req.body.next_id;
  var type = (typeof req.body.type === 'undefined') ? 0 : req.body.type;
  var feature = (typeof req.body.feature === 'undefined') ? 0 : req.body.feature;
  console.log(catId, prev_id, req.body.next_id);
  postReorder(feature, type, catId, next_id, prev_id).then(function (data) {
    res.send(data);
  });
});


app.post('/karaoke/EditCategory', function(req, res) {

  // api.post('/admin/karaoke/categories', {
  //   formData: {
  //     icon_image: req.files.icon_image === 'undefined'? '' :fs.createReadStream(config.app.uploadsDir + '/' + req.files.icon_image.name),
  //     display_name: req.body.display_name,
  //     twitter_handle: (typeof req.body.twitter_handle === 'undefined') ? '' : req.body.twitter_handle,
  //     show_on_top: req.body.show_on_top,
  //   },
  //   token: token,
  // }).then(function (data){
  //   //console.log(data)
  //   res.send(data);
  // });

});