app.behaviors.commentBtn = function ($comments) {
  var $commentsHolder = $comments.find('.comment-box-inner');
  var $commentsOpener = $comments.find('.opener');
  var $commentsLoader = $comments.find('.load-more');
  var $commentInputBox = $comments.find('.input-textarea');
  var $commentInfo = $comments.find('.commentinfo');
  var totalComments = parseInt($commentInfo.data('total-comments'));
  var pageNum = 1;


  /**
   * for mixPanel Data
   */
  var $commentData = $comments.find('.answer-comments');
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $commentData.data('username');
  var userid = $commentData.data('userid');
  var link = $commentData.data('entity-link');
  var type = $commentData.data('entity-type');

  var pageNum = 1;
  var sourceUrl = $commentInfo.data('source');
  var isLoadedOnce = false;
  var loadedComments = function () {
    return parseInt($commentInfo.data('loaded-comments'));
  };

  var loadMoreComments = function (callback) {
    // Google Analytics function
    ga(['send', 'Comments', 'LoadMore Comments', 'Widgets']);
    mixpanel.track(
      'LoadMore Comments',
      {
        'screen_type': screen,
        'platform': navigator.platform,
        'entity_username': username,
        'entity_userid': userid,
        'entity_link': link,
        //'entity_type': type
      }
    );
    if (totalComments === 0) return;

    callback = typeof(callback) === 'function' ? callback : function () {
    };

    var answerId = $commentInfo.data('id');
    app.utils.ajax.get('/widgets' + sourceUrl, {data: {page: pageNum}}).then(function (html) {
      if (isLoadedOnce) {
        $commentsHolder.append(html);
      } else {
        isLoadedOnce = true;
        $commentsHolder.html(html);
      }
      $commentInfo.data('loaded-comments', $commentsHolder.children().length);
      pageNum += 1;
      if (totalComments <= loadedComments()) {
        $commentsLoader.remove();
      }
      $comments.find('span.count').html(loadedComments());

      callback();
    }, function (xhr) {
      console.log(xhr)
    });
  };

  $commentsOpener.on('click', function (ev) {
    ev.preventDefault();
    loadMoreComments(function () {
      $commentsOpener.fadeOut();
    });
  });

  $commentsLoader.on('click', function (ev) {
    ev.preventDefault();
    loadMoreComments();
  });

  var commentHtml = function (commentText, userImg, userName, commentTime) {

    var commentHtml = '' +
      '<div class="row answer-comment-list">' +
      '<div class="col s3 pading-none" style="padding: 0px;">' +
      '<img class=" circle responsive-img" style ="height:65px;width:65px" src="' + (userImg || '/img/user.png') + '">' +
      '</div>' +
      '<div class="col s9 right valign">' +
      '<span class="white-text user-name">' + commentText + '</span>' +
      '<span class="white-text user-comment"><a href="' + app.utils.site(userName) + '" class="scolor2">' + userName + '</a></span>' +
      '</div>' +
      '</div>';
    return commentHtml;
  };
  //'<span class="white-text user-mintues">' + commentTime + '</span>' +

  $commentInputBox.on('keyup', function (ev) {
    ev.stopPropagation();
    // check if the key was enter key and some comment has been
    // entered
    if (ev.keyCode === 13 && $commentInputBox.val().length > 0) {
      var commentText = $commentInputBox.val();
      var commentTime = new Date();
      //$commentInput.disabled = true;
      //console.log('sourceurl',sourceUrl);
      app.utils.ajax.post(sourceUrl, {data: {body: commentText}})
        .then(function () {
          //$commentInput.disabled = false;
          ga(['send', 'Comments', 'Added', 'Widgets']);
          mixpanel.track(
            'Comment Posted',
            {
              'screen_type': screen,

              'platform': navigator.platform,
              'entity_username': username,
              'entity_userid': userid,
              'entity_link': link,
              //'entity_type': type
            }
          );
          $commentInputBox.val('');
          $commentsHolder.prepend(commentHtml(commentText, $commentInputBox.data('user-img'), $commentInputBox.data('user-name'), commentTime));

          totalComments += 1;
          $comments.data('total-comments', totalComments);
          $comments.find('span.total').html(totalComments);
          $comments.find('.comment-showing').show();
          $comments.find('.no-comment').hide();
          var newLoadedComments = loadedComments() + 1;
          $commentInfo.data('loaded-comments', newLoadedComments);
          $comments.find('span.count').html(newLoadedComments);
        });
    }
  });
};
