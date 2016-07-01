app.components.playableAnswerCard = function ($card) {
  var $overlay = $card.find('.overlay');
  var $video = $card.find('video');
  var currentOpacity = $overlay.css('opacity');
  var $text = $card.find('.question-play');
  var username = $video.data('username');
  var isViewed = false;
  var page = app.$body.data('source');

  $overlay.on('click', function (ev) {
    ev.preventDefault();
    $overlay.fadeTo(400, 0, function () {
      $overlay.css({display: 'none'});
    });
    $video[0].play();
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && page === 'askPopup') {
      var username = app.$body.data('profile');
      mixpanel.track(
      "Video Playing",
      { "Source": app.$body.data('source'),
        "User": username,
        "Profile": false
      }
      );
      isViewed = true;
    }
  });

  $video.on('click pause', function (ev) {
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
    if (app.utils.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
  
  
};