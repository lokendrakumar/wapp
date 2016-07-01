app.components.introVideo = function ($container) {

  var $video = $container.find('video');
  var isPlaying = false;

  $video.on('click', function () {
    if (isPlaying) {
      $video.trigger('pause');
    } else {
      $video.trigger('play');
    }
  });

  $video.on('pause ended', function () {
    isPlaying = false;
  });

  $video.on('play', function () {
    isPlaying = true;
  });

};
