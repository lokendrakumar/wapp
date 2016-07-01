app.behaviors.commentBtn = function($comments){
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
      '<div class="row">'+
        '<div class="columns xs-ws-bottom small-2 np">'+
          '<img class="img-c img-f gs hv" src="'+(userImg || '/img/user.png')+'">'+
        '</div>'+
        '<div class="columns xs-ws-bottom small-10 scolor2">'+
          '<p class="s2 scolor nm">'+commentText+'</p>'+
          '<div class="s2 scolor2"><p class="s nm"><a href="'+app.utils.site(userName)+'" class="scolor2">'+ userName+'</a></p></div>'+
        '</div>'+
      '</div>'
    ;

    return commentHtml;
  };

  $commentInput.on('keyup', function (ev) {
    // check if the key was enter key and some comment has been
    // entered
    ev.preventDefault();
    if (ev.keyCode === 13 && $commentInput.val().length > 0) {
      var commentText = xssFilters.inHTMLData($commentInput.val());
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
