app.components.campaignCard = function($pane) {
  /**
   * follow functionality
   */
  var $followBtn = $pane.find('.followBtn');
  var $followersCount = $pane.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);

   
  /**
   * ask user popup
   */
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
  

  var hWbalancer = function () {
    $pane.find('.video-wrapper-cir').css({
      'height': $('.video-wrapper-cir').innerWidth()
    });
    $pane.find('.pic-wrapper-cir').css({
      'height': $('.pic-wrapper-cir').innerWidth()
    });
  };

  hWbalancer();
  
  // needs refactor
  app.$window.on('resize', function() {
    hWbalancer();
  });

  var isPlaying = false;

  var $videoPlayBtn = $pane.find('.playBtn');
  var $video = $pane.find('video.introVideo');

  $videoPlayBtn.on('click', function() {
    if (! isPlaying) {
      hWbalancer();
      $video.show();
      $video.trigger('play');
      $videoPlayBtn.fadeOut();
      isPlaying = true;
    }
  });

  $video.on('click ended', function() {
    if (isPlaying) {
      $video.trigger('pause');
      //$videoPlayBtn.fadeIn();
      //$video.hide();
      isPlaying = false;
    } else {
      $video.trigger('play');
      isPlaying = true;
    }
  });
};