var app = module.exports = require('express')();
var _ = require('lodash');
var api = require('api');
var Promise = require('bluebird');
var fn = require('fn');
var pages = require('apps/newsite/partials');
var view = require('view').prefix('newsite');
var htmlResponse = fn.views.htmlResponse;
var getUserFeed = fn.data.getUserFeed;
var getMyFeed = fn.data.getMyFeed;
var getTrending = fn.data.getTrending;
var authFilter = fn.filters.authFilter;
var fs = require('fs');
var merge = fn.ffmpeg.merge;
var mergeAll = fn.ffmpeg.mergeAll;
var convertToMp4 = fn.ffmpeg.convertToMp4;
var cropToFitSameAspectRatioWidth = fn.ffmpeg.cropToFitSameAspectRatioWidth;
var cropToFit = fn.ffmpeg.cropToFit;
var config = require('config');


/**
 * create video
 */
/*app.post('/create-video', authFilter, function (req, res) {
  api.post('/post/blog/media/add ', {
    json: {
      video_media: req.body.video_media,
      answer_type: req.body.answer_type
    },
    token: req.token
  }).then(
    function (feed) {
      console.log(feed);
      //res.render(//answerCard partial required, args);
    },
    function (err) {
      res.status(400).send({msg: 'failed'});
    });
});*/

/**
 * Upload answers
 */
app.post('/me/upload-answer', authFilter, function (req, res) {
  var widget = req.body.widgets == true ? true : false;
  if (req.files.audio == null) {
    if (req.files.video == null) {
      api.post('/post/add', {
        formData: {
          question_id: req.body.questionId
        },
        token: req.token,
        widget: req.body.widgets
      }).then(
        function (data) {
          res.send(data);
        },
        function (err) {
          res.status(400).send({msg: 'failed'});
        }
      );
    } else {
      api.post('/post/add', {
        formData: {
          question_id: req.body.questionId,
          video_media: fs.createReadStream(config.app.uploadsDir + '/' + req.files.video.name)
        },
        token: req.token,
        widget: req.body.widgets
      }).then(
        function (data) {
          res.send(data);
        },
        function (err) {
          res.status(400).send({msg: 'failed'});
        }
      );
    }
  } else {

    mergeAll(req.files, false, function (err, mergedFile) {
      if (err) {
        res.status(400).send({msg: 'failed'});
      } else {
        api.post('/post/add', {
          formData: {
            question_id: req.body.questionId,
            video_media: fs.createReadStream(mergedFile)
          },
          token: req.token,
          widget: req.body.widgets
        }).then(
          function (data) {
            fs.unlink(mergedFile);
            res.send(data);
          },
          function (err) {
            res.status(400).send({msg: 'failed'});
          }
        );
      }
    });
  }
});

/**
 * update profile
 */
app.post('/me/update-profile', authFilter, function (req, res) {
  if (req.files.audio == null) {
    if (req.files.video == null) {
      api.post('/user/update_profile/' + req.user.id, {
        formData: {
          bio: req.body.bio,
          first_name: req.body.first_name
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
    } else {

      var formdataFront;
      if (req.body.bio != null && req.body.first_name != null) {
        formdataFront = {
          bio: req.body.bio,
          first_name: req.body.first_name,
          profile_video: fs.createReadStream(config.app.uploadsDir + '/' + req.files.video.name)
        }
      } else {
        formdataFront = {
          profile_video: fs.createReadStream(config.app.uploadsDir + '/' + req.files.video.name)
        }
      }
      api.post('/user/update_profile/' + req.user.id, {
        formData: formdataFront,
        token: req.token
      }).then(
        function (data) {
          res.send(data);
        },
        function (err) {
          res.status(400).send({msg: 'failed'});
        }
      );
    }
  } else {
    mergeAll(req.files, true, function (err, mergedFile) {

      if (err) {

        res.status(400).send({msg: 'failed'});
      } else {
        if (req.body.bio != null || req.body.first_name != null) {
          api.post('/user/update_profile/' + req.user.id, {
            formData: {
              bio: req.body.bio,
              first_name: req.body.first_name,
              profile_video: fs.createReadStream(mergedFile)
            },
            token: req.token
          }).then(
            function (data) {
              fs.unlink(mergedFile);
              res.send(data);
            },
            function (err) {
              res.status(400).send({msg: 'failed'});
            }
          );
        } else {

          api.post('/user/update_profile/' + req.user.id, {
            formData: {
              profile_video: fs.createReadStream(mergedFile)
            },
            token: req.token
          }).then(
            function (data) {
              fs.unlink(mergedFile);
              res.send(data);
            },
            function (err) {
              res.status(400).send({msg: 'failed'});
            }
          );
        }
      }
    });
  }
});

/**
 * create video
 */
app.post('/me/create-video', authFilter, function (req, res) {
  if (req.files.audio == null){
        api.post('/post/upload/start', {
          json: {
            caption_text: (req.body.page_url || req.body.captionText).toString()
          },
          token: req.token
        }).then(function(data) {
          var shortId = data.short_id;

          console.log('caption: ',req.body.captionText);
          console.log('page url: ',req.body.page_url);
          console.log('short id: ', shortId);


          if (req.body.page_url) {
            api.post('/post/blog/media/add', {            
              formData: {
                video_media: fs.createReadStream(config.app.uploadsDir + '/' + req.files.video.name),
                page_url: (req.body.page_url).toString(),
                caption_text: 'I commented on'+' '+(req.body.page_url).toString(),
                client_id: shortId,
                post_type: "comment"
              },
              token: req.token,
            }).then(
              function (data) {
                //fs.unlink(mergedFile);
                res.send(shortId);
              },
              function (err) {
                res.status(400).send({msg: 'failed with comment host url'});
              }
            );
          } else if ((req.body.captionText).length !== 0) {
            api.post('/post/blog/media/add', {
              formData: {
                caption_text: req.body.captionText,
                video_media: fs.createReadStream(config.app.uploadsDir + '/' + req.files.video.name),
                client_id: shortId
              },
              token: req.token,
              widget: req.body.widgets
            }).then(
              function (data) {
                //fs.unlink(mergedFile);
                res.send(shortId);
              },
              function (err) {
                res.status(400).send({msg: 'failed with caption'});
              }
            );
          } else {
            res.status(400).send({msg: 'Error in posting video'});
          }
        },
        function (err) {
          res.status(400).send({msg: 'Error in getting short id'});
        }
        );  
      
    
} else {
  mergeAll(req.files, false, function (err, mergedFile) {
    if (err) {
      res.status(400).send({msg: 'Merge Failed'});
    } else {

      api.post('/post/upload/start', {
        json: {
          caption_text: (req.body.page_url || req.body.captionText).toString()
        },
        token: req.token
      }).then(function(data) {
        var shortId = data.short_id;

        console.log('caption: ',req.body.captionText);
        console.log('page url: ',req.body.page_url);
        console.log('short id: ', shortId);


        if (req.body.page_url) {

          console.log('creating comment');

          api.post('/post/blog/media/add', {            
            formData: {
              video_media: fs.createReadStream(mergedFile),
              page_url: (req.body.page_url).toString(),
              caption_text: 'I commented on'+' '+(req.body.page_url).toString(),
              client_id: shortId,
              post_type: "comment"
            },
            token: req.token,
          }).then(
            function (data) {
              fs.unlink(mergedFile);
              res.send(shortId);
            },
            function (err) {
              res.status(400).send({msg: 'failed with comment host url'});
            }
          );
        } else if ((req.body.captionText).length !== 0) {

          console.log('creating blog');

          api.post('/post/blog/media/add', {
            formData: {
              caption_text: req.body.captionText,
              video_media: fs.createReadStream(mergedFile),
              client_id: shortId
            },
            token: req.token,
            widget: req.body.widgets
          }).then(
            function (data) {
              fs.unlink(mergedFile);
              res.send(shortId);
            },
            function (err) {
              res.status(400).send({msg: 'failed with caption'});
            }
          );
        } else {
          res.status(400).send({msg: 'Error in posting video'});
        }
      },
      function (err) {
        res.status(400).send({msg: 'Error in getting short id'});
      }
      );  
    }
  });  
}
 
});
