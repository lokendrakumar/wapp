app.components.recorder = function ($card) {

  var $video = $card.find('video');
  var $audio = $card.find('audio');
  var $recordBtn = $card.find('.recordBtn');
  var $countdown = $card.find('#countdown');
  var type = $card.data('type');
  var resourceId = $card.data('resource');
  var sourceUrl = $card.data('page-url');
  var widget = $card.data('widget');
  var $continueBtn = $card.find('.continue');
  var $continueBtnHolder = $card.find('.continueHolder');
  var $reject = $card.find('.reject');
  var recordedOnce = false;
  var formData;
  var onMobile = parseInt($card.data('onmobile')) === 1;
  var pageUrl = app.utils.currentUrl(true);
  var recorder;
  var streamOut;
  var timeUp = false;
  var blobs = {
    audio: null,
    video: null,
    mediaSize: null
  };

  var $attachVideo = $card.find(".attachButton");
  var $attachVideoFile = $card.find('.attachedVideo');
  var audioSrc;
  var videoSrc;
  var attachVideo = false;
  formData = new FormData();
  var $inputMobile;
  if (onMobile) {
    $inputMobile = $card.find('input[name="answerVideoRecord"]');
  }
  app.$window.on('load', function () {
    if (onMobile) {
      $inputMobile.trigger("click");
    } else {
      $recordBtn.trigger('record');
    }
  });

  if (onMobile) {
    $inputMobile.on('click', function (ev) {
      //$recordBtn.trigger('stop');
    });
    $inputMobile.on('change', function (ev) {
      var $input = $(ev.currentTarget);
      var video = $input[0].files[0];
      blobs.video = video;
      if (video === undefined) {
        return;
      }

      if (video.size > (40 * 1024 * 1024)) {
        alert('files greater than 40MB not allowed');
        return;
      }

      if (video.duration > 90) {
        alert('Video duration is greater than 90 seconds');
        return;
      }
      $recordBtn.trigger('stop');
    });
  }

  $recordBtn.on('record', function (ev) {
    ev.preventDefault();
    $continueBtnHolder.hide();
    $recordBtn.show();

    if (onMobile) {
      ev.preventDefault();
      return;
    }
    navigator.getUserMedia({video: true, audio: true}, function (stream) {
      streamOut = stream;
      $video[0].volume = 0;
      $video.attr('src', window.URL.createObjectURL(stream));
      app.behaviors.video($video);
      $recordBtn.on('click', function (ev) {
        ev.stopPropagation();
        $attachVideo.hide();
        $card.find('.circleText').html('Stop');
        $video.trigger('croptofit');
        if (!recordedOnce) {
          recorder = new MultiStreamRecorder(stream);
          recorder.start(92 * 1000);
          ////////////////////////////////////////
          var secondsPassed = 0;
          recordedOnce = true;
          var timePlayedInterval = setInterval(function () {
            secondsPassed += 1;
            var minutes = Math.floor(secondsPassed / 60);
            var seconds = Math.floor(secondsPassed % 60);

            seconds = seconds.toString().length === 1 ? '0' + seconds : seconds;

            if (secondsPassed === 90) {
              // trigger the pausing click
              $recordBtn.trigger('stop');
            }
          }, 1000);

          var time = 90;
          /* how long the timer runs for */
          var initialOffset = '195';
          var i = 1;
          var interval = setInterval(function () {
            $('.circle_animation').css('stroke-dashoffset', initialOffset - (i * (initialOffset / time)));
            if (i === (time)) {
              clearInterval(interval);
            }
            i++;

          }, 1000);

          recorder.ondataavailable = function (data) {
            blobs.audio = app.utils.blobToFile(data.audio, 'recordAudio');
            blobs.video = app.utils.blobToFile(data.video, 'recordVideo');
            //blobs.audio = data.audio;
            //blobs.video = data.video;
            blobs.size = data.audio.size + data.video.size;
           // console.log(blobs.audio, 'total size');
            if (navigator.mozGetUserMedia) {
              // console.log("mozilla");
              formData.append('audio', null);
            } else {
              formData.append('audio', blobs.audio);
            }

            formData.append('video', blobs.video);
            audioSrc = URL.createObjectURL(blobs.audio);
            videoSrc = URL.createObjectURL(blobs.video);

          };

        } else {
          $recordBtn.trigger('stop');
        }
      });

    }, function (err) {
      alert('Allow your webcam to record the video');

    });

  });

  $recordBtn.on('stop', function () {
    if (!onMobile && !attachVideo) {
      recorder.stop();
      streamOut.stop();

    }

    
    //var videoSrc = URL.createObjectURL(blobs.video);
    //var audioSrc = URL.createObjectURL(blobs.audio);
    var mobileRecorder = function () {

      $card.find('.mobileFirstScreen').hide();
      $card.find('.mobileUploadScreen').show();

      var continueBtn = function () {
        $video.attr('src', videoSrc);
        $audio.attr('src', audioSrc);
        $video.removeAttr('autoplay');
        $audio.removeAttr('autoplay');
        if (widget) {
          formData.append('widgets', true);
        } else {
          formData.append('widgets', false);
        }
        if (type === 'blog' && sourceUrl) {
          formData.append('caption', 'Video Comment');
          formData.append('page_url', sourceUrl);
          app.utils.ajax.post('/me/create-video', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("question-id", resourceId);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);
                //$card.find('.shareContainer').data("question-id", resourceId) ;
                //console.log( $card.find('.shareContainer').data("question-id"))

              });  
              console.log('Successfully added'); 
             //window.close();
            }, 
            function (err) {
              window.close();
              console.log(err);
            }
          );
        }else if (type === 'blog') {
          formData.append('caption', resourceId);
          app.utils.ajax.post('/me/create-video', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
             window.close();
            }, function (err) {
             window.close();
              console.log(err);
            }
          );
        } else if (type === 'question' && resourceId) {
          formData.append('questionId', resourceId);
          app.utils.ajax.post('/me/upload-answer', {
            data: formData,
            processData: false,
            contentType: false,
            widgets: widget ? widget : false
          }).then(
            function (data) {
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("question-id", resourceId);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);
                //$card.find('.shareContainer').data("question-id", resourceId) ;
                //console.log( $card.find('.shareContainer').data("question-id"))

              });
              console.log("Successfully added");
            },
            function (err) {
              // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
              // $uploadAttachedVideo.html('Add Video');
              // $uploadAttachedVideo.removeClass('disabled');
              // $cancelVideo.removeClass('disabled');
            }
          );
        } else {
          app.utils.ajax.post('/me/update-profile', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
              //console.log(data);
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);

                //$card.html(data.shareCard);
              });
              console.log("Successfully added");

            },
            function (err) {
              // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
              // $uploadAttachedVideo.html('Add Video');
              // $uploadAttachedVideo.removeClass('disabled');
              // $cancelVideo.removeClass('disabled');
            }
          );
        }
      };

      continueBtn();
    }

    if (onMobile) {
      mobileRecorder();
      $inputMobile.off('change');
    }
    if (!attachVideo) {
      $recordBtn.hide();
      $countdown.hide();
      $continueBtnHolder.show();
    }
    // $reject.show();
    $reject.on('click', function () {
      window.location.reload();

    });
    $continueBtn.on('click', function (ev) {
      $card.find('.mobileUploadScreen').show();
      $video.attr('src', videoSrc);
      $audio.attr('src', audioSrc);
      $video.removeAttr('autoplay');
      $audio.removeAttr('autoplay');
      $video[0].pause();

      if (widget) {
        formData.append('widgets', true);
      } else {
        formData.append('widgets', false);
      }
      $continueBtnHolder.hide();
      if (sourceUrl) {
        formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'Video Comment'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'blog') {
        console.log('creating', type);
        //formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'check out my this post'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'question' && resourceId) {
        formData.append('questionId', resourceId);
        app.utils.ajax.post('/me/upload-answer', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              //console.log(data.shareCard);
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      } else {
        app.utils.ajax.post('/me/update-profile', {
          data: formData,
          processData: false,
          contentType: false,
          widgets: widget ? widget : false
        }).then(
          function (data) {
            //console.log(data);
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);

              //$card.html(data.shareCard);
            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      }
    });

    $video.attr('src', videoSrc);
    $audio.attr('src', audioSrc);

    $video[0].play();
    $audio[0].play();

  });
  
  $attachVideo.on('click', function (ev) {
    ev.preventDefault();
    $attachVideoFile.show();
    $attachVideoFile.trigger('click');
  });

  $attachVideoFile.on('change', function (ev) {
    ev.preventDefault();
    $attachVideo.hide();
    $recordBtn.hide();
    var $input = $(ev.currentTarget);
    blobs.video = $input[0].files[0];
    blobs.size = $input[0].files[0].size;    
    formData.append('audio', null);
    formData.append('video', blobs.video);
    attachVideo = true;
    $recordBtn.trigger('stop');
    var upload = function () {
      $card.find('.mobileUploadScreen').show();
      $video.attr('src', videoSrc);
      $audio.attr('src', audioSrc);
      $video.removeAttr('autoplay');
      $audio.removeAttr('autoplay');
      if (widget) {
        formData.append('widgets', true);
      } else {
        formData.append('widgets', false);
      }
      $continueBtnHolder.hide();
      if (sourceUrl) {
        formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'Video Comment'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'blog') {
        console.log('creating', type);
        //formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'check out my this post'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'question' && resourceId) {
        formData.append('questionId', resourceId);
        app.utils.ajax.post('/me/upload-answer', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              //console.log(data.shareCard);
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      } else {
        app.utils.ajax.post('/me/update-profile', {
          data: formData,
          processData: false,
          contentType: false,
          widgets: widget ? widget : false
        }).then(
          function (data) {
            //console.log(data);
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);

              //$card.html(data.shareCard);
            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      }
    }
    if (blobs.size > (40 * 1024 * 1024)) {
      alert('files greater than 40MB not allowed');
      window.location.reload();
    } else {
      upload();
    }
      
  });
  
}