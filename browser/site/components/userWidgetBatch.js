app.components.userWidgetBatch = function ($card) {

  var $btn = $card.find('.ask');
  var $img = $card.find('.ans-thumb0');
  var $video = $card.find('.profile-video');
  var $overlayBefore = $card.find('.beforePlaying');
  var $questionOverlay = $card.find('.questionOverlay');
  var $overlayOnPause = $card.find('.overlayOnPause');
  var $icons = $card.find('.icons');
  var $commentBtn = $card.find('.commentBtn');
  var $comments = $card.find('.comments');
  var $dropdown = $card.find('.f-dropdown');
  var $iconComment = $icons.find('.commentBtn');
  var $hideComment = $comments.find('.hide-comments');
  var $followDiv = $overlayOnPause.find('.followDiv');
  var $playIcon = $overlayOnPause.find('.playIcon');
  var $introVideo = $overlayBefore.find('.intro-video');
  var $pauseQuestionOverlay = $overlayOnPause.find('.pauseQuestionOverlay');

  var $spanUpvotes = $card.find('.spanUpvotes');
  var $upvoteText = $card.find('.upvoteText');
  var upvotes = parseInt($spanUpvotes.html());

  var isPlaying = false;
  var isOver = false;
  var dropdown = false; 
  var isClicked = false;


  /* Comments Behavior Start*/

  var commentWidgetBehavior = function($comments){
    var $commentsHolder = $comments.find('.comment-box-inner');
    var $commentsOpener = $comments.find('a.cmtTrg');
    var $commentsLoader = $comments.find('a.load-more');
    var $commentsInfo = $comments.find('.comments-info');
    var $commentsShowAll = $comments.find('.show-all');
    var $commentInput = $comments.find('input.comment-input');
    var $inputCommentMessage = $comments.find('.no-comment');
    var totalComments = parseInt($comments.data('total-comments'));
    var pageNum = 1;
    var sourceUrl = $comments.data('source');
    var isLoadedOnce = false;
    var loadedComments = function () {
      return parseInt($comments.data('loaded-comments'));
    };

    var showComments = function () {
      $comments.animate({'margin-top': '3.2em'}, 300);
      $comments.find('.comment-box').addClass('expanded');
      $comments.find('.comment-input').fadeIn();
    };

    var loadMoreComments = function (callback) {
      if (totalComments === 0) return;

      callback = typeof(callback) === 'function' ? callback : function () { };

      var answerId = $comments.data('id');
      app.utils.ajax.get(sourceUrl, {data: {page: pageNum}}).then(function (html) {
        if (isLoadedOnce) {
          $commentsHolder.append(html);
        } else {
          isLoadedOnce = true;
          $commentsHolder.html(html);
        }
        
        $comments.data('loaded-comments', $commentsHolder.children().length);
        pageNum += 1;
        if (totalComments <= loadedComments()) {
          $commentsLoader.remove();
        }
        $comments.find('span.count').html(loadedComments());

        callback();
      }, function (xhr) { console.log(xhr) });
    };

    $commentsOpener.on('click', function (ev) {
      ev.preventDefault();
      loadMoreComments(function () {
        showComments();
        $commentsOpener.fadeOut();
      });
    });

    $commentsLoader.on('click', function (ev) {
      ev.preventDefault();
      loadMoreComments();
    });

    var commentHtml = function (commentText, userImg, userName) {
      var commentHtml = ''+
        '<div class="row collapse">'+
          '<div class="columns xs-ws-bottom small-2 np">'+
            '<img class="img-c img-f gs hv" src="'+(userImg || '/img/user.png')+'">'+
          '</div>'+
          '<div class="columns xs-ws-bottom small-9 scolor2">'+
            '<p class="s2 scolor3 nm">'+commentText+'</p>'+
            '<p class="s2 nm"><a href="'+app.utils.site(userName)+'" class="scolor2">'+ userName+'</a></p>'+
          '</div>'+
        '</div>'
      ;

      return commentHtml;
    };

    $commentInput.on('keyup', function (ev) {
      // check if the key was enter key and some comment has been
      // entered
      if (ev.keyCode === 13 && $commentInput.val().length > 0) {
        var commentText = $commentInput.val();
        $commentInput.disabled = true;
        app.utils.ajax.post(sourceUrl, {data: {body: commentText}})
          .then(function () {
            $commentInput.disabled = false;
            $commentInput.val('');
            $commentsHolder.prepend(commentHtml(commentText, $commentInput.data('user-img'), $commentInput.data('user-name') ));

            totalComments += 1;
            $comments.data('total-comments', totalComments);
            $comments.find('span.total').html(totalComments);

            var newLoadedComments = loadedComments() + 1;
            $comments.data('loaded-comments', newLoadedComments);
            $comments.find('span.count').html(newLoadedComments);

            $inputCommentMessage.fadeOut('slow');
            $commentsInfo.removeClass('hide');
            $commentsShowAll.removeClass('hide');
          });
      }
    });
  };
  /* Comments Widget End*/

  if(upvotes <= 0) {
    $upvoteText.hide();
  } else {
    $upvoteText.show();
  }

  $introVideo.on('click', function (ev){
    ev.stopPropagation();
  })
  app.behaviors.video($introVideo, true);

  $overlayBefore.on('click', function (ev) {
    ev.stopPropagation();
    $questionOverlay.slideUp();
    $overlayBefore.hide();
    $video.trigger('play');
    app.behaviors.video($video, true);
  });

  

  $video.on('pause', function (ev) {
    $playIcon.html('<i class="icon-vid scolor2 f-2x"></i>');
    $followDiv.hide();
    $overlayOnPause.show();
    $comments.hide();
    $icons.show();
    $icons.delay(500).animate({'bottom':'1em'},"slow");
    
  });

   
  $overlayOnPause.on('click', function (ev) {
    $video.on('ended', function (ev){
      isOver = true;

    });
    if (!isOver) {
      $video.trigger('click');
      $overlayOnPause.hide();
    }
      
  });

  $video.on('ended', function (ev){
      isOver = true;
      $overlayOnPause.show();
      $followDiv.delay(500).fadeIn().slideDown();
      $icons.animate({'bottom':'5em'},"slow");
      $playIcon.hide().html('<i class="icon-replay scolor"></i>').fadeIn();
  });

  $playIcon.on('click', function (ev){
    $overlayOnPause.hide();
    $video.trigger('click');
  });

  

  var $embedBtn = $card.find('.embedBtn');
  $embedBtn.on('click', function (ev) {
    ev.stopPropagation();
    ev.preventDefault();
    var $embedModal = $('#embedModal');
    $embedModal.html($card.find('div.embedTmpl').html());
    app.utils.loadModal($embedModal);
  });

  var $reportButton = $card.find('.report-user');
  app.behaviors.report($reportButton);


  $commentBtn.on('click', function (ev){
    ev.stopPropagation();
    $comments.slideDown('slow');
    $followDiv.hide();
    $icons.delay(500).animate({'bottom':'1em'},"slow");
    $pauseQuestionOverlay.hide();
  });
  
    
      
    
      


  $hideComment.on('click', function (ev){
    ev.preventDefault();
    $comments.slideUp('slow');
    $pauseQuestionOverlay.show();
    if (isOver) {
      $icons.delay(500).animate({'bottom':'5em'},"slow");
      $followDiv.show();
    }
   // $icons.slideUp();
  });

  $comments.on('click', function (ev){
    ev.stopPropagation();
  });
  var shareSelector = '#icon-share-'+$card.attr('id');
  var $shareIcon = $card.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareIcon);

  var $likeBtnTrg = $card.find('.likeBtnTrg');
  var $likeBtn = $card.find('.likeBtn');
  var $likeBtnIcon = $card.find('.likeBtnIcon');

  $likeBtnTrg.on('unliked.widget', function (ev){
    $likeBtnIcon.addClass('rc');
  });

  $likeBtnTrg.on('liked.widget', function (ev){
    //console.log("here");
    $likeBtnIcon.removeClass('rc');
    $likeBtnIcon.removeClass('brandc');
  });
  app.behaviors.likeBtn($likeBtnTrg, $likeBtn);

  var $followBtn = $card.find('.followBtn');
  app.behaviors.followBtn($followBtn);

  commentWidgetBehavior($comments);

  /*
   * Google Event Tracking
   */
  $video.on('play', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Play', $video.attr('src')]);
  });
  $video.on('pause', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Pause', $video.attr('src')]);
  });
  $video.on('ended', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Ended', $video.attr('src')]);
  });

};