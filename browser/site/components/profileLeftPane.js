app.components.profileLeftPane = function ($pane) {

  //linkify profile bio text  

  var $profileBio = $pane.find('.bioDisplay');
  
  app.behaviors.linkify($profileBio);

  /**
   * play intro functionality
   */
  
  var $video = $pane.find('video');
  var $overlay = $pane.find('div.dvImgOverlay');
  var $videoHolder = $pane.find('.dvHolder');
  var $icon = $pane.find('.icon-vid');
  var $image = $pane.find('.userImg');
  var videoSrc = $video.attr('src');

  imagesLoaded($image[0], function (instance) {
    var top = parseInt($overlay.width())/2;
    var width = $videoHolder.width();
    $icon.attr("style", "top:"+(top - 20)+"px; left:"+(top-20)+"px;");
    $videoHolder.css("height", width);
  });

  $overlay.on('click', function () {
    if (videoSrc) {
      $overlay.fadeOut();
      $video.fadeIn();
      $video.trigger('click');
    } else {
      app.utils.notify('Sorry! The video you requested is not available.', 'error', 5);
    }
  });

  $video.on('pause ended', function (ev) {
    $overlay.fadeIn();
    $video.fadeOut();
  });

  app.behaviors.video($video);

  /**
   * follow functionality
   */
  var $followBtn = $pane.find('.followBtn');
  var $followersCount = $pane.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);

  /**
    * Report User Functionality
    */
  var $reportButton = $pane.find('.report-user');
  app.behaviors.report($reportButton);
};