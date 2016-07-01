//Follow behavior
app.behaviors.followBtn = function($followBtn, $followersCount){

    
    var followActionUrl = function (type) {
      var targetUrl = $followBtn.data('target');
      var parts = targetUrl.split('/'); parts[1] = type;
      return parts.join('/');
    };
    
    var attachFollowingBehavior = function () {
      $followBtn.hover(
        function(){
          $followBtn.html('<i class="icon-minus"><\/i> Unfollow');
        },
        function(){
          $followBtn.html('<i class="icon-check"><\/i> Followed');
        }
      );
    };

    var detachFollowingBehavior = function () {
      $followBtn.off('mouseenter');
      $followBtn.off('mouseleave');
      $followBtn.html('<i class="icon-plus"></i> Follow');
    };


    $followBtn.on('click', function (ev) {
      
      if ($followBtn.data('state') === 'not-following') {
        $followBtn.trigger('user.followed');
      } else if ($followBtn.data('state') === 'following') {
          $followBtn.trigger('user.unfollowed');
      }
      var targetUrl = $followBtn.data('target');
      var state = $followBtn.data('state');
      var profile = $followBtn.data('profile');
      var username = $followBtn.data('username');
      var page = app.$body.data('source');
      app.utils.btnStateChange($followBtn, "Processing...", true);
      app.utils.ajax.post(targetUrl)
        .then(
          function () {
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
              $followBtn.data('target', followActionUrl('unfollow'));
              if ($followersCount !== undefined) {
                $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) + 1);
              }
              $followBtn.addClass('success');
              $followBtn.removeClass('sec');
              $followBtn.html('<i class="icon-check"></i> Followed');
              $followBtn.removeClass('disabled');
              app.utils.btnStateChange($followBtn, '<i class="icon-check"></i> Followed', false);
              attachFollowingBehavior();
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
              $followBtn.data('state', 'not-following');
              $followBtn.data('target', followActionUrl('follow'));
              if ($followersCount !== undefined) {
                $followersCount.length > 0 && $followersCount.html(parseInt($followersCount.html()) - 1);
              }
              $followBtn.removeClass('success');
              $followBtn.removeClass('disabled');
              if (profile === true){
                $followBtn.removeClass('sec');  
              } else {
                $followBtn.addClass('sec');
              }
              $followBtn.html('<i class="icon-plus"></i>Follow');
              app.utils.btnStateChange($followBtn, '<i class="icon-plus"></i> Follow', false);
              detachFollowingBehavior();
            }
          },
          function (xhr) {
            app.utils.btnStateChange($followBtn, "Follow", false);
            if (xhr.status !== 401) {

            }
          }
        );
    });
  };
