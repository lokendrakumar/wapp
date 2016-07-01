app.components.userCard = function ($container) {
  var $introVideo = $container.find('.introVideo');
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $videoHolder = $introVideo.parent();
  var $followBtn = $container.find('.followBtn');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.trigger('play');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
  });
  app.behaviors.followBtn($followBtn);
}
