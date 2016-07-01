//Follow behavior
app.behaviors.followBtn = function ($followBtn, $followersCount) {

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $followBtn.data('username');
  var userid = $followBtn.data('userid');
  var link = $followBtn.data('entity-link');
  var type = $followBtn.data('entity-type');

  var targetUrl = $followBtn.data('target');
  

  var followActionUrl = function (type) {
    var parts = targetUrl.split('/');
    parts[1] = type;
    return parts.join('/');
  };

  var attachFollowingBehavior = function () {
    $followBtn.hover(
      function () {

        $followBtn.html('Unfollow');
      },
      function () {
        $followBtn.html('Followed');

      }
    );
  };

  var detachFollowingBehavior = function () {
    $followBtn.off('mouseenter');
    $followBtn.off('mouseleave');
    $followBtn.html('Follow');
  };


  var profile = $followBtn.data('profile');
  var username = $followBtn.data('username');
  var page = app.$body.data('source');
  //app.utils.btnStateChange($followBtn, "Processing...", true);

  $followBtn.on('click', function (ev){
    ev.stopPropagation();
    $followBtn.html('Loading');
    app.utils.ajax.post(targetUrl)
    .then(
    function () {
      var state = $followBtn.data('state');
      ga(['send', 'Follow', 'Follow', 'Widgets']);
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
      if (state === 'not-following') {
        // if existing state is not-following, that means the user
        // was followed
        // if (page === 'askPopup') {
        //   mixpanel.track(
        //   "Followed",
        //   { "Source": app.$body.data('source'),
        //     "User": username
        //   }
        //   );
        // }
        $followBtn.data('state', 'following');
        $followBtn.addClass('following');
        $followBtn.data('target', followActionUrl('unfollow'));
        if ($followersCount !== undefined) {
          $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) + 1);
        }

        $followBtn.html('Followed');
      } else if (state === 'following') {
        // if existing state is not-following, that means the user
        // was unfollowed
        // if (page === 'askPopup') {
        //   mixpanel.track(
        //   "UnFollowed",
        //   { "Source": app.$body.data('source'),
        //     "User": username
        //   }
        //   );
        // }
        ga(['send', 'Follow', 'Unfollow', 'Widgets']);
        mixpanel.track(
          'Unfollow',
          {
            'screen_type': screen,

            'platform': navigator.platform,
            'entity_username': username,
            'entity_userid': userid,
            'entity_link': link,
            //'entity_type': type
          }
        );
        $followBtn.data('state', 'not-following');
        $followBtn.data('target', followActionUrl('follow'));
        $followBtn.removeClass('following');
        if ($followersCount !== undefined) {
          $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) - 1);
        }


        $followBtn.html('Follow');
      }
      var page = app.$body.data('page');
    },
    function (xhr) {
      app.utils.btnStateChange($followBtn, "Follow", false);
      if (xhr.status !== 401) {

      }
      ;
    });
  });


}