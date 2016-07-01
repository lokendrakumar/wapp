app.components.videoCommentCard = function($commentCard){
  
  var $commentVideo = $commentCard.find('.answerVideo');
  var $commentContainer = $commentCard.find('.answer-video.videoContainer');
  var $commentFirst = $commentCard.find('.answer-first');
  var $commentPaused = $commentCard.find('.answer-paused');
  var $commentBlank = $commentCard.find('.answer-blank');
  var $replayBtn = $commentBlank.find('.replay-video-icon');
  var videoEnded = false;
  var user_id = $commentVideo.data('user-id');


   $commentFirst.on('click',function (){
    app.behaviors.video($commentVideo, true);
    $commentVideo.trigger('click');
    $commentContainer.attr('style','display:block;');
    $commentFirst.css("display",'none');
  });
  var $pausedPlayBtn = $commentPaused.find('.play-video-icon');
  $pausedPlayBtn.on('click',function (){
    $commentVideo.trigger('click');
    $commentContainer.css('display','block');
    $commentPaused.css('display','none');
    videoEnded = false;
  });
   $commentVideo.on('pause ended', function (ev) {
    $commentContainer.css('display','none');
    $commentPaused.css('display','block');
    $commentBlank.css('display','none');
    videoEnded = false;
  });
   $commentVideo.on('ended',function (){
    videoEnded = true;
    $commentPaused.css('display','none');
    $commentBlank.css('display','block');
  });
    $replayBtn.on('click', function (ev){
    $commentBlank.css('display','none');
    $commentContainer.css('display','block');
    $commentPaused.css('display','none');
    $commentVideo.trigger('click');
    videoEnded = false;
  });
}