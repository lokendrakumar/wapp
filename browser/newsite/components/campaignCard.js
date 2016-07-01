app.components.campaignCard = function($pane) {

  var $askUser = $pane.find('.askUser');
  var username = $askUser.data('username');
  $askUser.click(function() {
    mixpanel.track("Button clicked", {
      "Source": app.$body.data('source'),
      "User": username
    });
    var w = 700;
    var h = 450;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    
    var url = 'http://frankly.me/ask/' + username + '/question';
    return window.open(url, 'Ask anything',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
      w + ', height=' + h + ', top=' + top + ', left=' + left);
  });
  

 var $video = $pane.find('.introVideo1');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var $followContainer = $pane.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });
};