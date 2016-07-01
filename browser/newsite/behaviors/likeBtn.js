app.behaviors.likeBtn = function ($likeBtnTrg, $likeBtn) {
  var likeActionUrl = function (action) {
    var targetUrl = $likeBtnTrg.data('target');
    var parts = targetUrl.split('/');
    parts[1] = action;
    return parts.join('/');
  };

  var $icon = $likeBtnTrg.find('.likeBtnIcon');
  var $numLikes = $likeBtnTrg.find('.num_likes');
  var isWorking = false;

  $likeBtnTrg.on('click', likeButtonHandler);

  function likeButtonHandler (ev) {

    ev.stopPropagation();
    var targetUrl = $likeBtnTrg.data('target');
    var state = $likeBtnTrg.data('state');

    //$likeBtnTrg.unbind('click');
    if (!isWorking) {
      isWorking = true;
      app.utils.ajax.post(targetUrl)
        .then(
        function () {
          if (state === 'unliked') {
            // if current state is unliked, that means the
            // answer was liked
            $likeBtnTrg.data('target', likeActionUrl('unlike'));
            $likeBtnTrg.data('state', 'liked');
            $likeBtnTrg.trigger('liked.widget');
            $icon.addClass('brandc');
            $numLikes.html(parseInt($numLikes.html()) + 1);
            $likeBtn.text("Liked");
            //$likeBtn.bind('click', likeButtonHandler);
            isWorking = false;
          } else if (state === 'liked') {
            // if current state is liked, that means the
            // answer was unliked
            $likeBtnTrg.data('target', likeActionUrl('like'));
            $likeBtnTrg.data('state', 'unliked');
            $likeBtnTrg.trigger('unliked.widget');
            $icon.removeClass('brandc');
            $numLikes.html(parseInt($numLikes.html()) - 1);
            $likeBtn.text("Like");
            isWorking = false;
            //$likeBtn.bind('click', likeButtonHandler);
          }
        },
        function (xhr) {
          if (xhr.status !== 401) {

          }
          isWorking = false;
        }
      );
    }
  }
};
