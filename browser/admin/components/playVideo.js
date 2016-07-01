app.components.playVideo = function ($video) {
  var $introVideo = $video.find('.introVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });

}