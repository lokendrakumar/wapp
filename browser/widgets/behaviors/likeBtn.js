app.behaviors.likeBtn = function($likeBtnTrg, $likeBtn){
  var likeActionUrl = function (action) {
    var targetUrl = $likeBtnTrg.data('target');
    var parts = targetUrl.split('/'); parts[1] = action;
    return parts.join('/');
  };

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $likeBtnTrg.data('username');
  var userid = $likeBtnTrg.data('userid');
  var link = $likeBtnTrg.data('entity-link');
  var type = $likeBtnTrg.data('entity-type');

  var $icon = $likeBtnTrg.find('.mdi-action-thumb-up');
  var $numLikes = $likeBtnTrg.find('.num_likes');
  var isWorking = false;

  $likeBtnTrg.on('click', likeButtonHandler);

  function likeButtonHandler(ev) {

    ev.stopPropagation();
    var targetUrl = $likeBtnTrg.data('target');
    var state = $likeBtnTrg.data('state');

    //$likeBtnTrg.unbind('click');
    if (! isWorking) {
      isWorking = true;
      app.utils.ajax.post(targetUrl)
          .then(
            function () {
              if (state === 'unliked') {
                // if current state is unliked, that means the
                // answer was liked
                ga(['send', 'Video', 'Like', 'Widgets']);
                mixpanel.track(
                  'Follow',
                  {
                    'screen_type': screen,

                    'platform': navigator.platform,
                    'entity_username': username,
                    'entity_userid': userid,
                    'entity_link': link,
                    //'entity_type': type
                  }
                );
                $likeBtnTrg.data('target', likeActionUrl('unlike'));
                $likeBtnTrg.data('state', 'liked');
                $likeBtnTrg.trigger('liked.widget');
                $icon.addClass('red-text');
                $numLikes.html(parseInt($numLikes.html()) + 1);
                $likeBtn.html("&nbsp;Liked");
                //$likeBtn.bind('click', likeButtonHandler);
                isWorking = false;
              } else if(state === 'liked') {
                // if current state is liked, that means the 
                // answer was unliked
                ga(['send', 'Video', 'Unlike', 'Widgets']);
                mixpanel.track(
                  'Unlike',
                  {
                    'screen_type': screen,

                    'platform': navigator.platform,
                    'entity_username': username,
                    'entity_userid': userid,
                    'entity_link': link,
                    //'entity_type': type
                  }
                );
                $likeBtnTrg.data('target', likeActionUrl('like'));
                $likeBtnTrg.data('state', 'unliked');
                $likeBtnTrg.trigger('unliked.widget');
                $icon.removeClass('red-text');
                $numLikes.html(parseInt($numLikes.html()) - 1);
                $likeBtn.html("&nbsp;Likes");
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
