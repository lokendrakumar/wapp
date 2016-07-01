//Video play-pause functionality
app.behaviors.video = function($video, attachClickBehavior) {

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
  //var adapter = playerjs.HTML5Adapter($video[0]);
  // // Start accepting events
  //adapter.ready();
  

  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  // if (videoComesWithSrc) {
  //   if (url.indexOf('.mpd') >= 0) {
  //    isMpd = true;
  //   }
  // }
  
  
 

 
  // var context = new Dash.di.DashContext();
  // var player = new MediaPlayer(context);
  // if (isMpd && isDashSupported) {
  //   player.startup();
  //   player.attachView($video[0]);
  //   player.attachSource(url);
  // }
  
  
  

  $video.on('play', function (ev) {
    isPlaying = true;
    if (!isCropped) {
      isCropped= applyCropToFit();
     // isCropped = true;
    }
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.utils.ajax.post('/view', {
        data: {
          vurl: $video.attr('src'),
        }
      });
      mixpanel.track("Video played", {
          "Source": 'Site'
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

    return ($video[0].videoWidth > 0 ? true : false );
  };

  if ($videoHolder.hasClass('videoHolder') && $videoContainer.hasClass('videoContainer')) {
    $videoHolder.css({
      backgroundColor: '#fff',
      overflow: 'hidden'
    });

    $video.on('loadedmetadata', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
       // isCropped = true;
      }
    });

    $video.on('croptofit', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
        //isCropped = true;
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
    if (app.utils.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};