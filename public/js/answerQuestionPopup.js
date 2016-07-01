'use strict';

// start foundation
$(document).foundation();

// defining 
window.app = window.app === undefined ? {} : window.app;

// setting up commonly used vars
app.vent = $({});
app.$document = $(document);
app.$window = $(window);
app.$body = $('body');

// ovverriding navigator for cross browser stuff
navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

//////////////////////////////////////

app.setIntervalX = function (callback, delay, repetitions) {
  var x = 0;
  var intervalID = setInterval(function () {
    callback();
    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
};

//////////////////////////////////////

app.dataURLToBlob = function (dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURL.split(',')[1]);
  else
    byteString = unescape(dataURL.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
};

//////////////////////////////////////

app.blobToFile = function (blob, fileName) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  var ext = blob.type.split('/').reverse()[0];
  blob.name = fileName+'.'+ext;
  return blob;
};

//////////////////////////////////////

app.dataURLToFile = function (dataURL, fileName) {
  return app.blobToFile(app.dataURLToBlob(dataURL), fileName);
};

//////////////////////////////////////

app.$elRemoved = function(domNodeRemovedEvent, $el) {
  var $evTarget = $(domNodeRemovedEvent.target);

  return $evTarget.get(0) === $el.get(0) || $.contains($evTarget.get(0), $el.get(0));
};

//////////////////////////////////////

app.$elInViewport = function($el) {
  var el = $el.get(0);

  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;
  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }
  //console.log('top'+top+'left'+left+'width'+width+'height'+height);
  //console.log('wtop'+window.pageYOffset+'wleft'+window.pageXOffset+'Wwidth'+window.innerWidth+'wheight'+window.innerHeight);
  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
};

//////////////////////////////////////

app.preloaderHtml = function () {
  return (
    '<div class="row text-center">'+
      '<div class="small-1 columns small-centered">'+
        '<img class="img-h" src="/img/preloader.gif"/>'+
      '</div>'+
    '</div>'
  );
};

//////////////////////////////////////

app.currentUrl = function (withSearch) {
  var urlParts = [location.protocol, '//', location.host, location.pathname];
  if (withSearch === true) {
    return urlParts.concat([location.search]).join('');
  } else {
    return urlParts.join('');
  }
};

//////////////////////////////////////

app.feed = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;

  var loadMore = function () {
    if (! working && ! done) {
      working = true;

      $feedEnd.html(app.preloaderHtml());

      var offset = parseInt($feedEnd.data('page')) || 0;
      var pageUrl = app.currentUrl(true);

      app.ajax.get(pageUrl, {
          data: {
            page: offset, partials: ['feed']
          }
        })
        .then(function (partials) {
          // extracting feedDiv without using jquery
          // so that script tags remain intact
          var el = document.createElement('div');
          el.innerHTML = partials.feed;
          var feedDiv = el.getElementsByClassName('feed')[0];
          offset = $(el).find('[data-page]').attr('data-page');

          if (feedDiv.childElementCount > 0) {
            $feedHolder.find('.feed').append(feedDiv.innerHTML);
            $feedEnd.data('page', offset);
          } else {
            done = true;
          }

          $feedEnd.html('');

          working = false;
        }, function (res) { console.log(res); });
    }
  };

  var scrollListener = function () {
    if (app.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();
//loadMore();

};

//////////////////////////////////////

app.playableAnswerCard = function ($card) {
  var $overlay = $card.find('.overlay');
  var $video = $card.find('video');
  var currentOpacity = $overlay.css('opacity');
  var $text = $card.find('.question-play');
  var $usernameDiv = $card.find('.name');
  var username = $video.data('username');
  var page = app.$body.data('source');
  $usernameDiv.on('click', function (ev) {
    ev.stopPropagation();
  })
  $overlay.on('click', function (ev) {
    ga(['send', 'Video', 'Clicked', 'OpenQuestion']);
    ev.preventDefault();
    var poster = $video.attr('poster');
    if(poster.indexOf('preloader.gif') === -1) {
      $video.attr('poster', 'http://frankly.me/img/preloader.gif');
    }
    $overlay.fadeTo(400, 0, function () {
      $overlay.css({display: 'none'});
    });
    $video[0].play();
    app.vent.trigger('video-played', $video.data('uuid'));
    ga(['send', 'Video', 'Played', 'OpenQuestion']);
  });

  $video.on('click pause', function (ev) {
    ga(['send', 'Video', 'Paused', 'OpenQuestion']);
    ev.preventDefault();
    $video[0].pause();
    $overlay.css({display: 'block'});
    $overlay.fadeTo(400, currentOpacity);
  });

  // question text vertical center
  $text.css('padding-top', ($overlay.height() - $text.height())/2);  

  var autoPauseListener = function (ev, uuid) {
    if ($video.data('uuid') !== uuid) {
      $video.trigger('pause');
      $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
    }
  };

  app.vent.on('video-played', autoPauseListener);

  /**
   * tackling dynamic dom removal
   */
  var domNodeRemovalListener = function (ev) {
    if (app.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  /*
   * Share question on fb/twt/g+
   */
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var $shareContainer = $card.find('.share-container');
  var $fbShare = $shareContainer.find(".button.fb");
  var $twtShare = $shareContainer.find(".button.twt");
  var $gglShare = $shareContainer.find(".button.ggl");

  $fbShare.on('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ga(['send', 'FbShare', 'Clicked', 'OpenQuestion']);
    var shareUrl = $shareContainer.attr('data-url');
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $twtShare.on('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ga(['send', 'TweeterShare', 'Clicked', 'OpenQuestion']);
    var shareUrl = $shareContainer.attr('data-url');
    var shareText = $twtShare.attr('data-text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $gglShare.on('click', function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    ga(['send', 'GoogleShare', 'Clicked', 'OpenQuestion']);
    var shareUrl = $shareContainer.attr('data-url');
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });
  
  
};

//////////////////////////////////////

// modal bg-z-index
app.modalBgZIndex = 1000;

// load a particular modal via its selector
// optionally provide html via a url
// and run an optional callback on completion
app.loadModal = function (selector, url, callback, stacked) {
  // modals stack by default, ie. more than one modals can open at a time
  var stacked = stacked === false ? false : true;

  var modalLoader = function () {
    callback = typeof(callback) === 'function' ? callback : function () { };

    // if selector provided is an instance of jquery, then that is our modal
    // otherwise we try to find the modal using jquery
    var $modal = selector instanceof $ ? selector : $(selector);

    // if the modal provided is not one single modal, do nothing
    if ($modal.length !== 1) return;

    // attach and animate modal bg if it is not loaded already
    var $modalBg = $('div.reveal-modal-bg');
    if ($modalBg.length === 0) {
      $modalBg = $($.parseHTML('<div class="reveal-modal-bg" style="display: none;"></div>'));
      app.$body.append($modalBg);
      $modalBg.css({zIndex: app.modalBgZIndex}).fadeIn(200);
    }

    var openModal = function () {
      // get modalIndex
      var modalIndex = $('div.reveal-modal.open').length + 1;

      // hook in the modal closer
      $modal.find('i.icon-close').on('click', function () { app.unloadModal($modal); });
      $modal.addClass('open').css({
        display: 'block',
        visibility: 'visible',
        zIndex: app.modalBgZIndex + modalIndex + 1
      });

      // open the modal
      $modal.css('top', '50px');
      $modal.animate(
        {
          opacity: 1
        }, 
        {
          complete: function () {
            app.vent.trigger('modal.opened', $modal);
            callback();
          }
        }
      );
    };

    if (url === undefined || url === null) {
      openModal();
    } else {
      app.ajax.get(url).then(function (html) {
        $modal.html(html);
        openModal();        
      });
    }

    // close modal on clicking modal bg
    $modalBg.on('click', app.unloadOpenModals);
  };

  // if the loadModal call is not stacked, then unloadOpenModals before
  // loading our target modal. Otherwise just load our modal
  if (! stacked) {
    app.unloadOpenModals(modalLoader);
  } else {
    modalLoader();
  }
};

// unload $modal
app.unloadModal = function ($modal, callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  if ($modal.length > 0) {
    $modal.animate(
      {
        opacity: 0,
        top: '-'+(app.$window.scrollTop() + 100)+'px'
      },
      {
        done: function () {
          $modal.removeClass('open').css({display: 'none', visibility: 'none'});

          app.vent.trigger('modal.closed', $modal[0]);
          callback();

          var $openModals = $('div.reveal-modal.open');
          if ($openModals.length === 0) {
            var $modalBg = $('div.reveal-modal-bg');
            $modalBg.fadeOut(200, function () {
              $modalBg.remove();
            });
          }
        }
      }
    );
  } else {
    callback();
  }
};

// unload already opened modal and call a callback
app.unloadOpenModals = function (callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  var $modals = $('div.reveal-modal.open');

  app.unloadModal($modals, callback);
}

// close any open modal escape key press event
app.$document.on('keyup', function (ev) {
  if (ev.keyCode === 27) {
    app.unloadOpenModals();
  }
});

//////////////////////////////////////

app.video = function($video, attachClickBehavior) {

  if (attachClickBehavior !== false) {
    attachClickBehavior = true;
  }

  var videoComesWithSrc = $video.attr('src') !== undefined && $video.attr('src').indexOf('http') === 0;

  var uuid = $video.attr('data-uuid');
  var isPlaying = false;
  var isViewed = false;
  var page = app.$body.data('source');
  var isCropped = false;
  if ($video.data('record') === undefined && $video.attr('poster') === null) {
    $video.attr('poster','/img/video_loader.gif');
  }

  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  $video.on('play', function (ev) {
    isPlaying = true;
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.ajax.post('/view', {
        data: {
          vurl: $video.attr('src'),
        }
      });
      isViewed = true;
    }
  });

  $video.on('pause ended', function (ev) {
    isPlaying = false;
  });

  if (attachClickBehavior) {
    $video.on('click', function (ev) {
      if (isPlaying) {
        $video.trigger('pause');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
      } else {
        $video.trigger('play');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('play');
      }
    });
  }

  //// video positioning etc
  var $videoHolder = $video.parent();
  var $videoContainer = $videoHolder.parent();

  var applyCropToFit = function () {
    var cropToFit = $video.attr('data-crop-to-fit');
    if (cropToFit !== false && cropToFit !== undefined) {
      var squareVideo = $video.attr('data-square-video') !== false &&
                        $video.attr('data-square-video') !== undefined;

      // height/width ratio
      var heightWidthRatio = squareVideo ? 1 : 16/9;
      
      var containerWidth = $videoContainer.width();
      var containerHeight = squareVideo ? containerWidth : heightWidthRatio * containerWidth;

      $videoContainer.css({
        height: containerHeight,
        minHeight: containerHeight,
        position: 'relative',
        overflow: 'hidden'
      });

      if ((heightWidthRatio * $video[0].videoWidth) >= $video[0].videoHeight) {
        var videoMargin = (containerWidth - ((containerHeight/$video[0].videoHeight) * $video[0].videoWidth)) / 2;
        $videoHolder.css({
          height: $videoContainer.height(),
          width: (containerHeight/$video[0].videoHeight) * $video[0].videoWidth,
          marginLeft: videoMargin
        });

        $video.css({height: '100%', width: '100%', zIndex: -1});
      } else {
        var videoMargin = (containerHeight - ((containerWidth/$video[0].videoWidth) * $video[0].videoHeight)) / 2;
        $videoHolder.css({
          width: $videoContainer.width(),
          height: (containerWidth/$video[0].videoWidth) * $video[0].videoHeight,
          marginTop: videoMargin
        });

        $video.css({height: '100%', width: '100%'});
      }
    }
  };

  if ($videoHolder.hasClass('videoHolder') && $videoContainer.hasClass('videoContainer')) {
    $videoHolder.css({
      backgroundColor: '#fff',
      overflow: 'hidden'
    });

    $video.on('loadedmetadata', function (ev) {
      if (!isCropped) {
        applyCropToFit();
        isCropped = true;
      }
    });

    $video.on('croptofit', function (ev) {
      if (!isCropped) {
        applyCropToFit();
        isCropped = true;
      }
    });
  }

  /**
   * Playing one video at a time
   */
  var autoPauseListener = function (ev, uuid) {
    if ($video.data('uuid') !== uuid) {
      $video.trigger('pause');
      $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
    }
  };

  app.vent.on('video-played', autoPauseListener);

  /**
   * tackling dynamic dom removal
   */
  var domNodeRemovalListener = function (ev) {
    if (app.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};

///////////////////////////////////////////

// performs some utility functions too
app.ajax = function (method, url, params) {
  params = params === undefined ? {} : params;
  params.method = method;
  params.url = url;

  return $.ajax(params);
};

// adding utility methods to app.ajax
['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
  app.ajax[method.toLowerCase()] = function (url, params) {
    return app.ajax(method, url, params);
  };
});

///////////////////////////////////////////

app.init = function () {
  app.$panel = $('#panel');

  app.onMobile = parseInt(app.$panel.data('onmobile')) === 1;
  app.loggedIn = parseInt(app.$panel.data('loggedin')) === 1;
  app.questionId = app.$panel.data('questionid');
  app.videoRecordedOnce = false;
  
  app.uploadInProgress = false;
  app.uploadFinished = false;
  
  app.files = {
    video: null,
    audio: null,
    size: 0
  };
};

//////////////////////////////////////////////

app.validateEmail = function (email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}

/////////////////////////////////////////

app.states = {};

/////////////////////////////////////////

app.states.questionDisplay = (function () {
  var state = {
    dom: {},

    handlers: {
      fileInputClick: function (ev) {
        if (app.uploadInProgress || app.uploadFinished) {
          ev.preventDefault();
          return;
        }
      },

      videoFile: function (ev) {
        if (app.uploadInProgress || app.uploadFinished) {
          ev.preventDefault();
          return;
        }

        var $input = $(ev.currentTarget);
        var video = $input[0].files[0];

        if (video === undefined) {
          return;    
        }

        if (video.size > (40*1024*1024)) {
          alert('files greater than 40MB not allowed');
          return;
        }

        app.files.video = video;

        app.states.questionDisplay.done();
      },

      recorder: function (ev) {
        if (app.onMobile) {
          ev.preventDefault();
          return;
        }

        if (app.videoRecordedOnce) {
          window.location.reload();
          return;
        }

        navigator.getUserMedia({video: true, audio: true}, function (stream) {
          var $video = state.dom.$videoCaptureModal.find('video');
          $video[0].volume = 0;
          $video.attr('src', window.URL.createObjectURL(stream));

          /**
           * load modal with video playing
           */
          app.loadModal(state.dom.$videoCaptureModal, null, function () {
            /**
             * Record btn handler
             */
            var modalHasBeenClosed = false;
            var recorderStopped = false;
            var recorder = null;
            var $recordBtn = state.dom.$videoCaptureModal.find('.recordBtn');
            var $timePlayedDisplay = state.dom.$videoCaptureModal.find('span.time-played');
            var timePlayedInterval = null;

            var recordHandler = function (ev) {
              ev.preventDefault();
              if ($recordBtn.find('i').hasClass('icon-record')) {
                // modify this line for firefox compatibility

                recorder = new MultiStreamRecorder(stream);
                ////////////////////////////////////////
                /// max video time : 1.5 minutes, average length of a smoke
                recorder.start(90 * 1000);
                ////////////////////////////////////////
                var secondsPassed = 0;

                timePlayedInterval = setInterval(function () {
                  secondsPassed += 1;
                  var minutes = Math.floor(secondsPassed / 60);
                  var seconds = Math.floor(secondsPassed % 60);
                  seconds = seconds.toString().length === 1 ? '0'+seconds : seconds;

                  if (secondsPassed === 90) {
                    // trigger the pausing click
                    $recordBtn.trigger('click');
                  }

                  $timePlayedDisplay.html(minutes+':'+seconds);
                }, 1000);

                $recordBtn.find('i').removeClass('icon-record').addClass('icon-stop')
                $recordBtn.find('span.recordVideo').html("Stop");
              } else {

                clearInterval(timePlayedInterval);
                $timePlayedDisplay.html('0:00');

                $recordBtn.find('i').removeClass('icon-stop').addClass('icon-record')
                $recordBtn.find('span.recordVideo').html("Record");
                recorder.ondataavailable = function (data) {
                  if (!modalHasBeenClosed) {

                    // Store the recorded video and audio data into the media object
                    app.files.audio = app.blobToFile(data.audio, 'recordAudio');
                    app.files.video = app.blobToFile(data.video, 'recordVideo');
                    app.files.size = data.audio.size + data.video.size;
                    // Now we can to the necessary shit

                    var audioSrc = window.URL.createObjectURL(app.files.audio);
                    var videoSrc = window.URL.createObjectURL(app.files.video);

                    state.dom.$attachedVideoModal.find('audio').attr('src', audioSrc);
                    state.dom.$attachedVideoModal.find('video').attr('src', videoSrc);
                    state.dom.$attachedVideoModal.find('audio')[0].play();
                    state.dom.$attachedVideoModal.find('video')[0].play();

                    recorderStopped = true;

                    app.unloadOpenModals(function () {
                      app.loadModal(state.dom.$attachedVideoModal, null, function () {
                        state.dom.$attachedVideoModal.find('video').trigger('croptofit');
                        /**
                         * attach modal close handler
                         */
                        var modalCloseHandler = function (ev, closedModal) {
                          if (state.dom.$attachedVideoModal[0] === closedModal) {
                            state.dom.$attachedVideoModal.find('video')[0].pause();
                            state.dom.$attachedVideoModal.find('audio')[0].pause();
                            app.vent.off('modal.closed', modalCloseHandler);
                          }
                        };

                        app.vent.on('modal.closed', modalCloseHandler);
                      });
                    });
                  }

                  $recordBtn.off('click', recordHandler);
                };

                recorder.stop();
                stream.stop();
              }
            };

            $recordBtn.on('click', recordHandler);
            app.videoRecordedOnce = true;

            /**
             * modal close handler
             */
            var modalCloseHandler = function (ev, closedModal) {
              if (closedModal === state.dom.$videoCaptureModal[0]) {
                modalHasBeenClosed = true;
                if (!recorderStopped) {
                  recorder && recorder.stop();
                  stream && stream.stop();
                }
                app.vent.off('modal.closed', modalCloseHandler);
                $recordBtn.off('click', recordHandler);
              }
            };

            app.vent.on('modal.closed', modalCloseHandler);
          });
        }, function (err){
          alert('Allow your webcam to record the video');
        });
      },

      recordedVideoSubmit: function (ev) {
        ev.preventDefault();
        app.unloadOpenModals();
        state.done();
      }
    },

    loadDom: function () {
      this.dom.$questionCard = app.$panel.find('.questionCard');
      this.dom.$answerVideoInput = app.$panel.find('input[name="answerVideoInput"]');

      if (app.onMobile) {
        this.dom.$answerVideoRecordInput = app.$panel.find('input[name="answerVideoRecord"]');
        this.dom.$answerVideoRecordBtn = null;
        this.dom.$attachedVideoModal = null;
        this.dom.$videoCaptureModal = null;
      } else {
        this.dom.$answerVideoRecordInput = null;
        this.dom.$answerVideoRecordBtn = app.$panel.find('.dvRecordVideo');
        this.dom.$attachedVideoModal = app.$panel.find('.attachedVideoModal');
        this.dom.$videoCaptureModal = app.$panel.find('.videoCaptureModal');


        app.video(this.dom.$attachedVideoModal.find('video'));
        app.video(this.dom.$videoCaptureModal.find('video'), false);
      }
    },

    load: function () {
      this.loadDom();

      this.dom.$answerVideoInput.on('click', this.handlers.fileInputClick);
      this.dom.$answerVideoInput.on('change', this.handlers.videoFile);

      if (app.onMobile) {
        this.dom.$answerVideoRecordInput.on('click', this.handlers.fileInputClick);
        this.dom.$answerVideoRecordInput.on('change', this.handlers.videoFile);
      } else {
        this.dom.$answerVideoRecordBtn.on('click', this.handlers.recorder);
        this.dom.$attachedVideoModal.find('.uploadVideoButton').on('click', this.handlers.recordedVideoSubmit);
        this.dom.$attachedVideoModal.find('.rejectVideoButton').on('click', app.unloadOpenModals);
      }
    },

    unload: function () {
      this.dom.$answerVideoInput.off('change', this.handlers.videoFile);

      if (app.onMobile) {
        this.dom.$answerVideoRecordInput.off('change', this.handlers.videoFile);
      } else {
        this.dom.$answerVideoRecordBtn.off('click', this.handlers.recorder);
      }
    },

    done: function () {
      this.unload();
      if (app.loggedIn) {
        app.states.uploadProgress.load();
      } else {
        app.states.userAuthPane.load();
      }
    }
  };

  return state;
}());

/////////////////////////////////////////

app.states.userAuthPane = (function () {
  var state = {
    dom: {},
    
    handlers: {
      nameInput: function (ev) {
        var $input = $(ev.currentTarget);
        if ($input.val().trim().length >= 2) {
          state.dom.$nxtBtn.removeClass('disabled');
        } else {
          state.dom.$nxtBtn.addClass('disabled');
        }
      },

      emailInput: function (ev) {
        var $input = $(ev.currentTarget);
        if (app.validateEmail($input.val())) {
          state.dom.$nxtBtn.removeClass('disabled');
        } else {
          state.dom.$nxtBtn.addClass('disabled');
        }
      },

      passwordInput: function (ev) {
        var $input = $(ev.currentTarget);
        if ($input.val().trim().length >= 6) {
          state.dom.$nxtBtn.removeClass('disabled');
        } else {
          state.dom.$nxtBtn.addClass('disabled');
        }
      },

      nxtClick: function (ev) {
        ev.preventDefault();
        var $btn = $(ev.currentTarget);
        
        if ($btn.hasClass('disabled')) {
          return;
        }

        var steps = {
          'name': 'email',
          'email': 'password',
          'password': 'submit'
        };

        var nextStep = steps[$btn.data('step')];

        if (nextStep === 'email') {
          state.dom.$askEmail.fadeIn();
          $btn.data('step', nextStep);
          $btn.addClass('disabled');
        }

        if (nextStep === 'password') {
          state.dom.$askPassword.fadeIn();
          $btn.data('step', nextStep);
          $btn.fadeOut(200).html('Submit').delay(200).fadeIn(200);
          $btn.addClass('disabled');
        }

        if (nextStep === 'submit') {
          var data = {
            fullName : state.dom.$askName.find('input').val(),
            email    : state.dom.$askEmail.find('input').val(),
            password : state.dom.$askPassword.find('input').val()
          };


          $btn.fadeOut(200).html('Submitting...').delay(200).fadeIn(200);

          // first try logging in using provided info
          app.ajax.post('/auth/local', {
            data: {username: data.email, password: data.password}
          }).then(function () {
            // move to next state if this works
            state.done();
          }).fail(function () {
            // if that fails, then try to register
            app.ajax.post('/auth/public/register-full', {
              data: data
            }).then(function (data) {
              // move to next state if this works
              state.done();
            }).fail(function (res) {
              // if that fails too, then confuse user
              alert('something went wrong, please try again');
              window.location.reload();
            }).always(function () {
              // but always, revert the text of submit button
              $btn.fadeOut(200).html('Submit').delay(200).fadeIn(200);
            });
          });
        }
      },

      fbAuth: function (ev) {
        var w = 700;
        var h = 480;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        window.openUniquePopUp('/auth/facebook', 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
      },

      twitterAuth: function (ev) {
        var w = 700;
        var h = 480;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        window.openUniquePopUp('/auth/twitter', 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
      },

      googleAuth: function (ev) {
        var w = 700;
        var h = 480;
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        window.openUniquePopUp('/auth/google', 'google', 'width='+w+',height='+h+',top='+top+',left='+left);
      }
    },

    loadDom: function () {
      this.dom.$nextStepsPane = app.$panel.find('.nextStepsPane');

      this.dom.$userAuthPane = this.dom.$nextStepsPane.find('.userAuthPane');
      this.dom.$nxtBtn = this.dom.$userAuthPane.find('.nxtBtn');
      this.dom.$socialAuthBar = this.dom.$userAuthPane.find('.socialAuthBar');
      this.dom.$askName = this.dom.$userAuthPane.find('.ask-intermediate-name');
      this.dom.$askEmail = this.dom.$userAuthPane.find('.ask-intermediate-email');
      this.dom.$askPassword = this.dom.$userAuthPane.find('.ask-intermediate-password');

      this.dom.$nxtBtn.data('step', 'name');
      this.dom.$nxtBtn.addClass('disabled');
    },

    loadAuthPopupFunctionality: function () {
      //set this to domain name
      var openedDomain = 'http://frankly.me';
      var trackedWindows = {};
      
      window.openUniquePopUp = function(path, windowName, specs) {
        trackedWindows[windowName] = false;
        var popUp = window.open(null, windowName, specs);
        popUp.postMessage('ping', openedDomain);
        setTimeout(checkIfOpen, 1000);
        setInterval(checkIfPinged, 1000);

        function checkIfOpen() {
          if (!trackedWindows[windowName]) {
            window.open(openedDomain + path, windowName, specs);
            popUp.postMessage('ping', openedDomain);
          }
        }

        function checkIfPinged() {
          popUp.postMessage('ping', openedDomain);
        }
      };

      if (window.addEventListener) {
        window.addEventListener('message', onPingBackMessage, false);

      } else if (window.attachEvent) {
        window.attachEvent('message', onPingBackMessage, false);
      }

      function onPingBackMessage(event) {
        if (event.origin == openedDomain) {
          var winst = event.source;
          winst.close();          
          trackedWindows[event.data] = true;
          // and here, we are done with things
          state.done();
        }
      };
    },

    load: function () {
      this.loadDom();
      this.loadAuthPopupFunctionality();

      if (! this.dom.$nextStepsPane.is(':visible')) {
        this.dom.$nextStepsPane.fadeIn(200, function () {
          app.$window.scrollTop(this.dom.$nextStepsPane.offset().top);
        }.bind(this));
      }

      this.dom.$userAuthPane.delay(200).fadeIn(200);

      this.dom.$askName.find('input').on('keyup', this.handlers.nameInput);
      this.dom.$askEmail.find('input').on('keyup', this.handlers.emailInput);
      this.dom.$askPassword.find('input').on('keyup', this.handlers.passwordInput);
      this.dom.$nxtBtn.on('click', this.handlers.nxtClick);
      
      this.dom.$socialAuthBar.find('.fb').on('click', this.handlers.fbAuth);
      this.dom.$socialAuthBar.find('.twt').on('click', this.handlers.twitterAuth);
      this.dom.$socialAuthBar.find('.ggl').on('click', this.handlers.googleAuth);
    },

    unload: function () {
      this.dom.$userAuthPane.fadeOut(200);
    },

    done: function () {
      this.unload();
      app.states.uploadProgress.load();
    }
  };

  return state;
}());

/////////////////////////////////////////

app.states.uploadProgress = (function () {
  var state = {
    dom: {},

    handlers: {},

    loadDom: function () {
      this.dom.$nextStepsPane = app.$panel.find('.nextStepsPane');

      this.dom.$processingPane = this.dom.$nextStepsPane.find('.dvProcessing');
      this.dom.$progressBar = this.dom.$processingPane.find('.progressBarHolder .progress');
    },

    startUpload: function () {
      var formData = new FormData;
      formData.append('audio', app.files.audio);
      formData.append('video', app.files.video);
      formData.append('questionId', app.questionId);
      formData.append('answerType', " ");
      formData.append('lat', null);
      formData.append('lon', null);
      formData.append('tags', null);

      app.ajax.post('/me/upload-answer', {
        data: formData,
        processData: false,
        contentType: false,
        xhr: function() {  // Custom XMLHttpRequest
          var xhr = new window.XMLHttpRequest();
          
          if (xhr.upload) { // Check if upload property exists
            xhr.upload.addEventListener('progress', function (e) {
              if(e.lengthComputable){
                var percentComplete = (e.loaded / e.total) * 100;
                percentComplete = Math.min(percentComplete, 70);
                state.dom.$progressBar.find('span').css('width', percentComplete + '%');
              }
            }, false); // For handling the progress of the upload
          }

          return xhr;
        }
      }).then(function () {
        var progressComplete = 80;
        app.setIntervalX(function () {
          state.dom.$progressBar.find('span').css('width', progressComplete + '%');
          progressComplete += 10;
        }, 1000, 3);

        setTimeout(function () {
          state.done();
        }, 3000)
      }).fail(function () {
        alert('something went wrong, please try again');
        window.location.reload();
      });
    },

    load: function () {
      this.loadDom();

      if (! this.dom.$nextStepsPane.is(':visible')) {
        this.dom.$nextStepsPane.fadeIn(200, function () {
          app.$window.scrollTop(this.dom.$nextStepsPane.offset().top);
        }.bind(this));
      }
      
      this.dom.$processingPane.delay(200).fadeIn(200);
      this.dom.$progressBar.find('span').width('0%');
      this.startUpload();
    },

    unload: function () {
      this.dom.$processingPane.fadeOut(200);
    },

    done: function () {
      this.unload();
      app.states.shareAnswer.load();

    }
  };

  return state;
}());

/////////////////////////////////////////

app.states.shareAnswer = {
  dom: {},

  handlers: {},

  loadDom: function () {
    this.dom.$shareAnswer = app.$panel.find('.shareAnswer');
  },

  load: function () {
    this.loadDom();
    this.dom.$shareAnswer.delay(200).fadeIn(200);
    setTimeout(function () {
      window.location.reload();
    }, 5000);

    this.dom.$shareAnswer.find('doneBtn', window.location.reload);
  },

  unload: function () {

  }
};

/////////////////////////////////////////

$(function () {
  app.init();
  app.states.questionDisplay.load();
});