app.components.answerCard = function($answerCard) {

  var $introVideo = $answerCard.find('.answer-first .introVideo');
  var $answerVideo = $answerCard.find('.answerVideo');
  var $answerImg = $answerCard.find('.answerImg');
  var $videoContainer = $answerCard.find('.answer-video.videoContainer');
  var $answerFirst = $answerCard.find('.answer-first');
  var $answerPaused = $answerCard.find('.answer-paused');
  var $answerBlank = $answerCard.find('.answer-blank');
  var $answerAdvertisement = $answerCard.find('.answer-advertisement');
  var $answerComments = $answerCard.find('.answer-comments');
  var $arrowUp = $answerCard.find('.arrow-up-icon');
  var $CommentPopup = $answerCard.find('.comment-popup');
  var $showCommentBox = $answerCard.find('.show-comment-box');
  var $followBtn = $answerCard.find('.followBtn');
  var $embedBtn = $answerCard.find('.embedBtn');

  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $replayBtn = $answerBlank.find('.replay-video-icon');
  var videoEnded = false;

  var $deleteVideo = $answerCard.find('.delete-video');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  // imagesLoaded($answerImg[0], function (instance) {
  //   var height = 500;
  //   var width = $answerImg.css('width');
  // });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });
  
 
  var user_id = $answerVideo.data('user-id');

  // app.behaviors.video($introVideo);

  $answerImg.on('click',function () {
    $answerVideo.trigger('play');
    $videoContainer.attr('style','display:block;');
    app.behaviors.video($answerVideo, true);
    $answerFirst.css("display",'none');
  });

  var $pausedPlayBtn = $answerPaused.find('.play-video-icon');

  $pausedPlayBtn.on('click',function (){

    $answerVideo.trigger('click');
    $videoContainer.css('display','block');
    $answerPaused.css('display','none');
    videoEnded = false;

  });

  $answerVideo.on('pause ended', function (ev) {
    $videoContainer.css('display','none');
    $answerPaused.css('display','block');
    $answerBlank.css('display','none');
    $answerComments.css('display', 'none');
    videoEnded =  false;
  });

  $answerVideo.on('ended',function (){

    videoEnded = true;
    $answerPaused.css('display','none');
    $answerBlank.css('display','block');
    //$replayBtn.css('display','none');




    // app.utils.ajax.get('/widgets/getUserType', {
    //   data: {
    //     user_id: user_id,
    //   }
    // }).then(function (data) {
    //   console.log(data);
    //   $answerBlank.css('display','block');
    // });
  });

  $CommentPopup.on('click',function (ev){
    ev.preventDefault();
    $answerPaused.css('display','none');
    $answerAdvertisement.css('display','none');
    $answerBlank.css('display','none');
    $answerComments.css('display','block');

  });

  $arrowUp.on('click', function (ev) {
    ev.preventDefault();
    if (!videoEnded) {
      $answerPaused.css('display','block');
    }
    else {
      $answerBlank.css('display','block');
    }
    $answerComments.css('display','none');
  });


  $replayBtn.on('click', function (ev){
    //ev.preventDefault();
    //$replayBtn.css('display','none');
    $answerBlank.css('display','none');
    $videoContainer.css('display','block');
    $answerPaused.css('display','none');
    $answerVideo.trigger('click');
  });

  $deleteVideo.on('click', function(ev) {

    var postId = $(this).data('user-id');
    app.utils.ajax.post('/widgets/post/delete', {
      data: {
        post_id: postId, 
      }
    }).then(function (data) {
      
      $answerCard.remove();
    });
  })


  //follow functionality

  var $followBtn = $answerCard.find('.followBtn');
  // var $followersCount = $answerCard.find('.followers-count');
  app.behaviors.followBtn($followBtn);

  /**
   * like button functionality
   */
  var $likeBtnTrg = $answerCard.find('.likeBtnTrg');
  var $likeBtn = $answerCard.find('.likeBtn');
  app.behaviors.likeBtn($likeBtnTrg, $likeBtn);

  /**
   * comments functionality
   */
  var $comments = $answerCard.find('.answer-comments');
  app.behaviors.commentBtn($comments);

  /*
   * Share question on fb/twt/g+
   */
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var shareUrl = $answerCard.data('share-url');
  var shareText = $answerCard.data('share-text');
  var $fbShare = $answerCard.find(".icon-facebook");
  var $twtShare = $answerCard.find(".icon-twitter");
  var $fbShareCount = $answerCard.find(".fb-share-count");
  var $twtShareCount = $answerCard.find(".twt-share-count");
  var postId = $answerCard.data('post-id');

  $fbShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
    var current_count = parseInt($fbShareCount.html());
    $fbShareCount.html(current_count + 1);
    app.utils.ajax.post('/widgets/share/update', {
      data: {
        platform: 'facebook',
        post_id: postId, 
      }
    }).then(function (data) {
      //write some fn here for success on count added
      });
  });

  $twtShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
    var current_count = parseInt($twtShareCount.html());
      $twtShareCount.html(current_count + 1);
      app.utils.ajax.post('/widgets/share/update', {
        data: {
          platform: 'twitter',
          post_id: postId, 
        }
      }).then(function (data) {
        //write some fn here for success on count added
        });
  });


  var $reportButton = $answerCard.find('.report-user');
  app.behaviors.report($reportButton);

}

$(document).ready(function () {
$('i.icon-options').click(function (e) {
        e.preventDefault();
        var flag = $(this).closest('i').find('ul.dropdown-content-new').css('display');
        $('i ul').hide('slow');
        if(flag == 'none'){
         $(this).closest('i').find('ul.dropdown-content-new').show('slow');
      } else {
         $(this).closest('i').find('ul.dropdown-content-new').hide('slow');
       }
    });
});
