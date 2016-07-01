app.components.profileVideoModal = function ($modal) {  
  /**
   * video modal functionality
   */
  var $cardMeta = $modal.find('.card-meta');
  var $shareIcon = $modal.find('.icon-share');
  var $video = $modal.find('video');

  var videoPlaying = function () {
    $cardMeta.fadeTo('slow', 0.3);
    $shareIcon.removeClass('f-1-5x').addClass('f-1-25x');
    $cardMeta.on('mouseenter', function () { $cardMeta.fadeTo('slow', 1); });
    $cardMeta.on('mouseleave', function () { $cardMeta.fadeTo('slow', 0.3); });
  };

  var videoNotPlaying = function () {
    $cardMeta.fadeTo('slow', 1);
    $shareIcon.removeClass('f-1-25x').addClass('f-1-5x');
    $cardMeta.off('mouseenter');
    $cardMeta.off('mouseleave');
  };

  app.behaviors.video($video);

  $video.on('play', videoPlaying);
  $video.on('pause ended', videoNotPlaying);

  var autoPauseListener = function (ev, closedModal) {
    var $closedModal = $(closedModal);
    if ($closedModal.children('.profileVideo').length > 0 && $closedModal.children('.profileVideo')[0] === $modal[0]) {
      $video.trigger('pause');
      app.vent.off('modal.closed', autoPauseListener);
    }
  };

  app.vent.on('modal.closed', autoPauseListener);

  // play video automatically by default
  $video.trigger('play');

  var $embedBtn = $modal.find('.embedBtn');
  $embedBtn.on('click', function (ev) {
    ev.preventDefault();
    var $embedModal = $('#embedModal');
    $embedModal.html($modal.find('script.embedTmpl').html());
    app.utils.loadModal($embedModal);
  });

  /**
   * follow functionality
   */
  var $followBtn = $modal.find('.followBtn');
  app.behaviors.followBtn($followBtn);
  
  /**
   * share functionality
   */
  var shareSelector = '#icon-share-'+$modal.attr('id');
  var $shareIcon = $modal.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareIcon);

};