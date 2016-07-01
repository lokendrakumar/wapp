//Video play-pause functionality
app.behaviors.video = function ($video, attachClickBehavior) {

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $video.data('username');
  var userid = $video.data('userid');
  var link = $video.data('entity-link');
  var type = $video.data('entity-type');

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
    $video.attr('poster', '/img/video_loader.gif');
  }
  //var adapter = playerjs.HTML5Adapter($video[0]);
  // // Start accepting events
  //adapter.ready();

  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  if (videoComesWithSrc) {
    if (url.indexOf('.mpd') >= 0) {
      // console.log('mpd');
      isMpd = true;
    }
  }

 // var context = new Dash.di.DashContext();
 // var player = new MediaPlayer(context);
 // if (isMpd && isDashSupported) {
 //   player.startup();
 //   player.attachView($video[0]);
 //   player.attachSource(url);
 // }

  $video.on('play', function (ev) {
    ga(['send', 'Video', 'Play', 'Widgets']);

    if (!isCropped) {
      isCropped = applyCropToFit();
      // isCropped = true;
    }

    // mixpanel.track(
    //   'Video Play',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );

    isPlaying = true;
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.utils.ajax.post('/view', {
        data: {
          vurl: $video.attr('src')
        }
      });
      mixpanel.track("Video played", {
        "Source": 'Widget'
      });
      isViewed = true;
    }
  });

  $video.on('pause', function (ev) {
    ga(['send', 'Video', 'Paused', 'Widgets']);
    // mixpanel.track(
    //   'Video Paused',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  $video.on('ended', function (ev) {
    ga(['send', 'Video', 'Ended', 'Widgets']);
    // mixpanel.track(
    //   'Video Ended',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  if (attachClickBehavior) {
    $video.on('click', function (ev) {
      ga(['send', 'Videos', 'Clicked', 'Widgets']);
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
  var $cardContainer = $videoContainer.parent();

  var applyCropToFit = function () {
    // console.log($video[0].videoWidth , $video[0].videoHeight,'css');
    var cropToFit = $video.attr('data-crop-to-fit');
    if (cropToFit !== false && cropToFit !== undefined) {
      var squareVideo = $video.attr('data-square-video') !== false &&
        $video.attr('data-square-video') !== undefined;

      // height/width ratio
      var heightWidthRatio = squareVideo ? 1 : 16 / 9;

      var containerWidth = $videoContainer.width();
      if (containerWidth >= 280){
        containerWidth = $cardContainer.width();
      }
      // console.log($videoContainer.width());
      var containerHeight = squareVideo ? containerWidth : Math.floor(heightWidthRatio * containerWidth);

      $videoContainer.css({
        height: containerHeight,
        minHeight: containerHeight,
        minWidth: containerHeight,
        position: 'relative',
        overflow: 'hidden'
      });
      if (Math.round(((heightWidthRatio * $video[0].videoWidth) / $video[0].videoHeight) - .28) === 1 ) {
        var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
        $videoHolder.css({
          height: $videoContainer.height(),
          width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
          marginLeft: videoMargin
        });
        $video.css({height: '100%', width: '100%'});
      } else {
        var videoMargin = (containerHeight - ((containerWidth / $video[0].videoWidth) * $video[0].videoHeight)) / 2;
        $videoHolder.css({
          width: containerWidth,
          height: (containerWidth / $video[0].videoWidth) * $video[0].videoHeight,
          marginTop: videoMargin
        });
        if ($video[0].videoWidth == 318 && $video[0].videoHeight == 572) {
          var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
          $videoHolder.css({
            height: $videoContainer.height(),
            width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
            marginLeft: videoMargin
          });
        }

        $video.css({height: '100%', width: '100%'});
      }
    }
    if ($videoContainer.width() == 280 && $videoContainer.height() == 503) {
      $video[0].videoWidth = containerWidth;
      $video[0].videoHeight = $videoContainer.height();
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
        //isCropped = true;
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
      var endedVideo = false;
      // $video.on('ended', function (ev){
      //   console.log("herererwerwer");
      //   endedVideo = true;
      // });
      if (!endedVideo) {
        $video.trigger('pause');
      }
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