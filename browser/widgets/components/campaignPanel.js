app.components.campaignPanel = function ($card) {
  var $openQuestion = $card.find('.openQuestionPartial').toArray();
 /* var $video = $card.find('.introVideo');
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var $followContainer = $card.find('.follow-container');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $video.fadeIn('slow');
    app.behaviors.video($video);
    $video.trigger('click');
  });*/
  var toggle_view = false;
  /*$(window).scroll(function() {
    if($(window).scrollTop() > 200 && !toggle_view){

      $('.profile-wrapper').addClass('profile-wrapper-fixed');
      $('.profile-video').addClass('profile-video-fixed');
      $followContainer.addClass('btn-profile-fixed');
      $('.profile-user').addClass('profile-user-fixed ');
      $('.profile-links').hide();
      setTimeout(function () {
        $video.parent().attr('style', '');
        $video.parent().parent().attr('style', '');
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);
      toggle_view = true;

     } else if ($(window).scrollTop() <= 200 && toggle_view){

      $('.profile-wrapper').removeClass('profile-wrapper-fixed');
      $('.profile-video').removeClass('profile-video-fixed');
      $followContainer.removeClass('btn-profile-fixed');
      $('.profile-user').removeClass('profile-user-fixed ');
      $('.profile-links').show();
      setTimeout(function () {
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);
       
      toggle_view = false;
    }

  });*/
  // app.behaviors.video($video);

  //follow functionality
/*
  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);
  */
  console.log($openQuestion);
  $openQuestion.forEach(function (index) {
    var $index = $(index);
    var username = $index.data('username');
    username='indiatoday';
    var slug = $index.data('slug');
    var url = $index.data('url');
    
    app.utils.ajax.get(url,{
      data: {
            partials: ['openQuestionCard']
      }
    }).then(function (partials) {
      $index.html(partials.openQuestionCard);
      $('.masonryGrid').masonry({
        itemSelector: '.masonryGridItem',
      }); 
    });
      
  });
};

