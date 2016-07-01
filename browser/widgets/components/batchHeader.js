app.components.batchHeader = function($header) {
  // var $navBarFixed = $('.navbar-fixed');
  var $askBtn = $header.find('.askBtn');
  var $userPicture = $header.find('.user-picture');
  var $mainFollow = $header.find('.main-follow');
  var $followBtn = $header.find('.followBtn');
  var $myButton = $('.my-button');
  var $video = $header.find('.introVideo');
  //app.behaviors.video($video);
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var url = $askBtn.data('url');
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  // $navBarFixed.hide();


var croptofitTriggered1 = false;
var croptofitTriggered2 = false;
  $(window).scroll(function() {
    //var bool = (500 + $(window).height() <= $(document).height());
     if($(window).scrollTop() > 200){
      $(".always-fixed-navbar").show();
      $(".fix-header").attr('style','visibility: hidden;');
        //avd $mainFollow.addClass('main-follow-fixed');
        //avd $userPicture.addClass('user-picture-fixed');
        //avd $userPicture.attr('style','width:70px;');  
        //$userFollow.addClass('user-follow-fixed');
        //avd $userFollowCss.addClass('user-follow-fixed');
        //avd $myButton.addClass('my-button-fixed');
        //avd $('.user-about-fixed').hide();
        //avd $('.user-information').addClass('user-information-fix');
        //app.behaviors.video($video);
        // $video.trigger('croptofit');
        setTimeout(function () {
        $video.parent().attr('style', '');
        $video.parent().parent().attr('style', '');
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);

       }else{
          $(".fix-header").attr('style','visibility: visible;');
          $(".always-fixed-navbar").hide();
           //avd $mainFollow.removeClass('main-follow-fixed'); 
           //avd $userPicture.removeClass('user-picture-fixed');
           //avd $userPicture.attr('style','width:150px;'); 
           //$userFollow.removeClass('user-follow-fixed');
           //avd $userFollowCss.removeClass('user-follow-fixed');
           //avd $myButton.removeClass('my-button-fixed');
           //avd $('.user-information').removeClass('user-information-fix');
           //avd $('.user-about-fixed').show();
           // app.behaviors.video($video);
           // $video.trigger('croptofit');
           setTimeout(function () {
             var width = $videoHolder.parent().parent().width();
             $videoHolder.css("height", width);
             app.behaviors.video($video);
             $video.trigger('croptofit');
           }, 1000);
       }

  });
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
   $introVideoImage.on('click', function () {
    $introVideoImage.hide();
    $video.show();
    app.behaviors.video($video);
    $video.trigger('click');
  });

  var $followBtnCount = $header.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followBtnCount);


};