var app = module.exports = require('express')();
var _ = require('lodash');

var api = require('api');
var fn = require('fn');
var fs = require('fs');
var categories = require('categories');
var view = require('view').prefix('widgets');
var pages = require('apps/widgets/partials');
var authFilter = fn.filters.authFilter;
var fs = require('fs');
var config = require('config');





var getComments = fn.data.getComments;
var getMe = fn.data.getMe; 


/**
 * ask a question to a user
 * REQUIRES AUTH FILTER
 */
app.post('/ask/:userId', authFilter, function (req, res) {
  if (req.body.question.is_anonymous === 'true') {
    var isAnonymous = 1;
  } else {
    isAnonymous = 0;
  }
  api.post('/question/ask', {

    json: {
      question_to: req.params.userId,
      is_anonymous: isAnonymous,
      body: req.body.question.body
    },

    token: req.token,

    widget: true
  }).then(
    function (data) {
      res.send(data);
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
});


/**
 * fetch comments partials
 */
app.get('/:answerId/comments', function (req, res) {
  var answerId = req.params.answerId;
  var page = _.isUndefined(req.query.page) ? 1 : parseInt(req.query.page);
  var offset = req.params.offset;

  getComments(answerId, page, req.token)
    .then(function (comments) {
      res.render(pages.answerPopup.comments, {comments: comments.list,next_index:comments.next_index});
    });
});


/*increase social share count
*/
app.post('/share/update', function (req, res) {
  api.post('/post/share/update', {
    json: {
      platform: req.body.platform,
      post_id: req.body.post_id
    },
    token: req.token
  }).then(
    function (data) {
      res.send(data);
    },
    function () {
      res.status(500).send({msg: 'something went wrong'});
    }
  );
});

app.post('/answer/delete' ,function(req, res){

  api.post('/post/delete', {
    json: {
      post_id: req.body.post_id
    },
    token: req.token
  }).then(
    function (data) {
      res.send(data);
    },
    function () {
      res.status(500).send({msg: 'something went wrong'});
    }
  );

});

app.post('/imageUplaod', authFilter,function(req,res){
  api.post('/openquestion/edit', {
    formData: {
      question_id: req.body.questionId,
      banner_image:fs.createReadStream(config.app.uploadsDir + '/' + req.files.image.name)
    },
    token: req.token
    }).then(
    function (data) {
      res.send(data);
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    }
  );
    
})