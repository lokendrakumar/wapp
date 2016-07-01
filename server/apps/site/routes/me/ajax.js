var app = module.exports = require('express')();
var _ = require('lodash');
var fs = require('fs');

var fn = require('fn');
var api = require('api');
var config = require('config');

var authFilter = fn.filters.authFilter;

var merge = fn.ffmpeg.merge;
var mergeAll = fn.ffmpeg.mergeAll;
var convertToMp4 = fn.ffmpeg.convertToMp4;
var cropToFitSameAspectRatioWidth = fn.ffmpeg.cropToFitSameAspectRatioWidth;
var cropToFit = fn.ffmpeg.cropToFit;

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
  mergeAll(req.files, false, function (err, mergedFile) {
    if (err) {
      res.status(400).send({msg: 'Merge Failed'});
    } else {
      if ((req.body.captionText).length == 0) {

        api.post('/post/blog/media/add', {
          formData: {
            caption_text: req.body.captionText,
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
            res.status(400).send({msg: 'failed with caption'});
          }
        );
      } else {
        if ((req.body.page_url).length !== 0) {
          api.post('/post/upload/start', {
            json: {
              caption_text: 'I commented on'+' '+(req.body.page_url).toString()
            },
            token: req.token
          }).then(function(data) {
            var shortId = data.short_id;
            api.post('/post/blog/media/add', {            
              formData: {
                video_media: fs.createReadStream(mergedFile),
                page_url: (req.body.page_url).toString(),
                caption_text: 'I commented on'+' '+(req.body.page_url).toString(),
                client_id: shortId
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
          });
        } else {

          api.post('/post/blog/media/add', {
            formData: {
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
              res.status(400).send({msg: 'failed without caption'});
            }
          );
        }
      }
    }
  });
});