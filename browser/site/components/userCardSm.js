app.components.userCardSm = function ($card) {
  
  /**
   * additional video functionalities
   */
  var $video = $card.find('video');
  var $overlay = $card.find('div.dvImgOverlay');
  var $videoHolder = $card.find('.dvHolder');
  var $videoImage = $videoHolder.find('img');
  var videoSrc = $video.attr('src');
  var $icon = $card.find('.icon-vid');
  var $inviteBtn = $card.find('.inviteBtn');
  var page = app.$body.data('source');
  var profile = false;
  
  var $userImage = $card.find("img.userImg");
  var imageSource = $userImage.attr("data-src");
    
  $userImage.attr("src", imageSource);

  imagesLoaded($userImage[0], function (instance) {
    var top = parseInt($overlay.width())/2;
    var width = $videoHolder.width();
    $icon.attr("style", "top:"+(top-20)+"px; left:"+(top-10)+"px;");
    $videoHolder.css("height", width);
    app.behaviors.video($video);
  });

  $overlay.on('click', function () {
    if (videoSrc) {
      $video.trigger('click');
      $overlay.fadeOut();
      $video.fadeIn();
    } else {
      app.utils.notify('Sorry! The video you requested is not available.', 'error', 5);
    }
  });

  $video.on('pause ended', function (ev) {
    $overlay.fadeIn();
    $video.fadeOut();
  });


  if ($video.data('profile-status') === 1) {
    profile = true;
  } 
  $video.on('video.playing', function (ev) {
    if (page === 'askPopup') {
      mixpanel.track(
      "Video Playing",
      { "Source": app.$body.data('source'),
        "User": $video.data('username'),
        "Profile": profile
      }
      );
    }
  });

  /**
   * follow functionality
   */
  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);

  /**
   * invite functionality
   */
  $inviteBtn.on('click', function (ev){
    var $link = $inviteBtn.find('a');
    var w = 700;
    var h = 480;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    window.open($link.attr("href"), 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  })
  
  $followBtn.on('user.followed', function (ev) {
    if (page === 'askPopup') {
      mixpanel.track(
      "Followed",
      { "Source": app.$body.data('source'),
        "User": $followBtn.data('username'),
        "Profile": false
      }
      );
    }
  });

  $followBtn.on('user.unfollowed', function (ev) {
    if (page === 'askPopup') {
      mixpanel.track(
      "UnFollowed",
      { "Source": app.$body.data('source'),
        "User": $followBtn.data('username'),
        "Profile": false
      }
      );
    }
  });
};
  