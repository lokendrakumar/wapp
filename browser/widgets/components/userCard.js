app.components.userCard = function ($container) {
  var $userCard = $container.find('.user-card');
  var $introVideo = $userCard.find('.introVideo');
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $videoHolder = $introVideo.parent();
  var $followBtn = $userCard.find('.followBtn');

  app.behaviors.followBtn($followBtn);
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
