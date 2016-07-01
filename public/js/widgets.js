'use strict';

// start foundation
//$(document).foundation();

// defining 
window.app = window.app === undefined ? {} : window.app;

// setting up commonly used vars
app.vent = $({});
app.$document = $(document);
app.$window = $(window);
app.$body = $('body');

// ovverriding navigator for cross browser stuff
navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

// defining BEHAVIORS - methods in browser/behaviors
app.behaviors = app.behaviors === undefined ? {} :  app.behaviors;

// defining COMPONENTS - methods in browser/components
app.components = app.components === undefined ? {} : app.components;

// defining UTILITIES - methods in browser/utils
app.utils = app.utils === undefined ? {} : app.utils;

// app in memory cache
app.cache = {};

app.requestArgs = {};

// use this instead of $.ajax
// performs some utility functions too
app.utils.ajax = function (method, url, params) {
  params = params === undefined ? {} : params;
  params.method = method;
  params.url = url;

  return $.ajax(params).always(function (argOne, status, argThree) {
    if (status === 'success') {
      var data = argOne;
      var xhr = argThree;
      var err = undefined;
    } else if (status === 'error') {
      var data = undefined;
      var xhr = argOne;
      var err = argThree;
    }

    // handle authentication modal
    if (xhr.status === 401) {
      app.utils.requestSerializer(method, url, params);
     // app.utils.loadModal('#authModal', '/widgets/modal/auth');
      $('#frankly-auth-modal').openModal();
    }

    // handle behavior for changing nav automatically
    if (method === 'GET' && data && data.nav && typeof(data.nav) === 'string') {
      $('#nav').html(data.nav);
    }

    if (method === 'GET' && data && data.panel && typeof(data.panel) === 'string') {
      $('#panel').html(data.panel)
    }
  });
};

// adding utility methods to app.utils.ajax
['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
  app.utils.ajax[method.toLowerCase()] = function (url, params) {
    return app.utils.ajax(method, url, params);
  };
});
// get current page url
app.utils.currentUrl = function (withSearch) {
  var urlParts = [location.protocol, '//', location.host, location.pathname];
  if (withSearch === true) {
    return urlParts.concat([location.search]).join('');
  } else {
    return urlParts.join('');
  }
};

// get website domain
app.utils.domain = function () {
  return [location.protocol, '//', location.host].join('');
};

app.utils.site = function (path) {
  return [location.protocol, '//', location.host,'/',path].join('');
};

app.utils.runningVideos = [];

app.utils.preloaderHtml = function () {
  return (
    '<div class="row text-center">'+
      '<div class="small-1 columns small-centered">'+
        '<img class="img-h" src="/img/preloader.gif"/>'+
      '</div>'+
    '</div>'
  );
};

// setting up commonly used functions
app.utils.$elInViewport = function($el) {
  var el = $el.get(0);

  var top = el.offsetTop;
  var left = el.offsetLeft;
  var width = el.offsetWidth;
  var height = el.offsetHeight;
  while(el.offsetParent) {
    el = el.offsetParent;
    top += el.offsetTop;
    left += el.offsetLeft;
  }
  //console.log('top'+top+'left'+left+'width'+width+'height'+height);
  //console.log('wtop'+window.pageYOffset+'wleft'+window.pageXOffset+'Wwidth'+window.innerWidth+'wheight'+window.innerHeight);
  return (
    top >= window.pageYOffset &&
    left >= window.pageXOffset &&
    (top + height) <= (window.pageYOffset + window.innerHeight) &&
    (left + width) <= (window.pageXOffset + window.innerWidth)
  );
};

// check if $el was removed
app.utils.$elRemoved = function(domNodeRemovedEvent, $el) {
  var $evTarget = $(domNodeRemovedEvent.target);

  return $evTarget.get(0) === $el.get(0) || $.contains($evTarget.get(0), $el.get(0));
};

app.utils.loadingBtn = function(id,d){
  var ID = $('#'+id);
  var org=ID.text();
  var orgVal=ID.val();
  ID.val("Processing...");
  ID.text("Processing...");
  ID.addClass('loading disabled');
  //var ref=this;
    if (d!=0){
     setTimeout(function() {
      ID.removeClass('loading disabled');
      ID.text(org);
      //ID.val(orgVal);
    }, d*1000);
  } 
};

app.utils.loadingBtnStop = function(id,value,result){
  var org=value;
  var ID = $('#'+id);
  ID.removeClass('loading').val(org);
  if (result=='success'){
    app.utils.notify('Your question was asked successfully','success', 2);
  } else {
    app.utils.notify('{{error code}} Error message from server','error', 2);
  }
};

app.utils.notify = function(text,type,duration){
  
    $('#alert-box').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');
  
  //Types are: alert, success, warning, info 
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000); 
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook').html('<div data-alert id="alert-box" class="alert-box-wrapper alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};

app.utils.notifyLogin = function(text,type,duration){
  
    
     $('#alert-hook2').fadeIn();
    $('#alert-box2').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');
    
  // Types are: alert, success, warning, info 
    if (duration!=0){
    setTimeout(function() {
      $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
    }, duration*1000); 
  }
  $(document).on('close.alert', function(event) {
    $('#alert-hook2').html('<div data-alert id="alert-box" class=" alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
  });
};


app.utils.internet = function() {
  //console.log('connectivty being monitored');
  window.addEventListener("offline", function(e) {
    app.utils.notify('internet connectivty lost. Please check your connection.', 'error', 0);
  }, false);

  window.addEventListener("online", function(e) {
    app.utils.notify('internet connectivty restored', 'success', 3);
  }, false);
};

app.utils.redirectTo = function (path) {
  window.location.href = app.utils.domain()+path;
};

/*app.utils.reloadNavAndPanel = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel']}
  }).then(function () {
    //$(document).foundation();
    // app.$body.find('.nav').html(data.nav);
    // app.$body.find('.container').html(data.panel);
  });
};
*/
app.utils.reloadNavAndPanel = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel']}
  }).then(function (data) {
    //$(document).foundation();
    //console.log(data.panel);
    //console.log(app.$body.find('#nav'));
    //console.log(app.$body.find('#panel'));
    app.$body.find('#nav').html(data.nav);
    app.$body.find('#panel').html(data.panel);
  });
};
app.utils.reloadNavAndPanelAndHeader = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel', 'header']}
  }).then(function (data) {
    //$(document).foundation();
    app.$body.find('.nav').html(data.nav);
    app.$body.find('.header').html(data.header);
    app.$body.find('.container').html(data.panel);
  });
};

app.utils.reloadNavOnly = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav']}
  }).then(function (data) {
    app.$body.find('.nav').html(data.nav);
  });
};

app.utils.get$videoSnapshotUrl = function ($video) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var video = $video[0];
  var videoWidth = video.videoWidth;
  var videoHeight = isNaN(video.videoHeight) ? (0.75 * videoWidth) : videoWidth;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  context.drawImage(video, 0, 0, videoWidth, videoHeight);
  return canvas.toDataURL('image/png');
};

app.utils.dataURLToBlob = function (dataURL) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURL.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURL.split(',')[1]);
  else
    byteString = unescape(dataURL.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], {type: mimeString});
};

app.utils.blobToFile = function (blob, fileName) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  var ext = blob.type.split('/').reverse()[0];
  blob.name = fileName+'.'+ext;
  return blob;
};

app.utils.dataURLToFile = function (dataURL, fileName) {
  return app.utils.blobToFile(app.utils.dataURLToBlob(dataURL), fileName);
};

app.utils.btnStateChange = function (button, message, disabled) {
  var $button = button;
  var imgHtml =  '<img src="/img/preloader.gif" class="left" style="max-width:25%;"/>'+
                  '<div class="inBtnState">'+
                  '</div>';
  
  
  if (disabled) {
    //$button.addClass('fullbtn');
   
    $button.html(imgHtml);
    var $inBtnState = $button.find('.inBtnState');
    $inBtnState.html(message);
    
    //$button.addClass('disabled');
  } else {
    //$button.removeClass('fullbtn');
    //$button.removeClass('disabled');    
    $button.html(message);
  }

};

app.utils.requestSerializer = function (method, url, params) {
  app.requestArgs.method = method;
  app.requestArgs.url = url;
  app.requestArgs.params = params;
}

app.utils.requestDeserializer = function (args) {
  app.utils.ajax(args.method, args.url, args.params);
  app.utils.reloadNavAndPanel();
}



//read in a form's data and convert it to a key:value object
app.utils.getFormData = function($form){
  var formData = {} ;
  $form.find(":input").not("[type='submit']").not("[type='reset']").each(function(){
    var thisInput = $(this);
    var value = thisInput.val();
    formData[thisInput.attr("name")] = value^0 === value ? parseInt(value) : value ;
  });
  return formData;
}
// modal bg-z-index
app.utils.modalBgZIndex = 1000;

// load a particular modal via its selector
// optionally provide html via a url
// and run an optional callback on completion
app.utils.loadModal = function (selector, url, callback, stacked) {
  // modals stack by default, ie. more than one modals can open at a time
  var stacked = stacked === false ? false : true;

  var modalLoader = function () {
    callback = typeof(callback) === 'function' ? callback : function () { };

    // if selector provided is an instance of jquery, then that is our modal
    // otherwise we try to find the modal using jquery
    var $modal = selector instanceof $ ? selector : $(selector);

    // if the modal provided is not one single modal, do nothing
    if ($modal.length !== 1) return;

    // attach and animate modal bg if it is not loaded already
    var $modalBg = $('div.reveal-modal-bg');
    if ($modalBg.length === 0) {
      $modalBg = $($.parseHTML('<div class="reveal-modal-bg" style="display: none;"></div>'));
      //app.$body.append($modalBg);
      $modalBg.css({zIndex: app.utils.modalBgZIndex}).fadeIn(200);
    }

    var openModal = function () {
      // get modalIndex
      var modalIndex = $('div.reveal-modal.open').length + 1;
      // hook in the modal closer
      $modal.find('i.icon-close').on('click', function () { app.utils.unloadModal($modal); });
      var $modalMaterialize = $modal.find('.modal');
      $modalMaterialize.addClass('open').css({
        display: 'block',
        visibility: 'visible',
        zIndex: app.utils.modalBgZIndex + 1
      });

      // open the modal
      $modalMaterialize.css('top', '50px');
      $modalMaterialize.animate(
        {
          opacity: 1
        }, 
        {
          complete: function () {
            app.vent.trigger('modal.opened', $modal);
            callback();
          }
        }
      );
    };

    if (url === undefined || url === null) {
      openModal();
    } else {
      console.log(url);
      app.utils.ajax.get(url).then(function (html) {
        $modal.html(html);
        openModal();        
      });
    }

    // close modal on clicking modal bg
    $modalBg.on('click', app.utils.unloadOpenModals);
  };

  // if the loadModal call is not stacked, then unloadOpenModals before
  // loading our target modal. Otherwise just load our modal
  if (! stacked) {
    app.utils.unloadOpenModals(modalLoader);
  } else {
    modalLoader();
  }
};

// unload $modal
app.utils.unloadModal = function ($modal, callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };
  console.log('close');
  if ($modal.length > 0) {
    $modal.animate(
      {
        opacity: 0,
        top: '-'+(app.$window.scrollTop() + 100)+'px'
      },
      {
        done: function () {
          $modal.removeClass('open').css({display: 'none', visibility: 'none'});

          app.vent.trigger('modal.closed', $modal[0]);
          callback();

          var $openModals = $('div.reveal-modal.open');
          if ($openModals.length === 0) {
            var $modalBg = $('div.reveal-modal-bg');
            $modalBg.fadeOut(200, function () {
              $modalBg.remove();
            });
          }
        }
      }
    );
  } else {
    callback();
  }
};

// unload already opened modal and call a callback
app.utils.unloadOpenModals = function (callback) {
  callback = typeof(callback) === 'function' ? callback : function () { };

  var $modals = $('div.reveal-modal.open');

  app.utils.unloadModal($modals, callback);
}

// close any open modal escape key press event
app.$document.on('keyup', function (ev) {
  if (ev.keyCode === 27) {
    app.utils.unloadOpenModals();
  }
});
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

app.behaviors.report = function ($reportButton) {
  
  var id = $reportButton.data('id');
  var postType = $reportButton.data('type');


  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $reportButton.data('username');
  var userid = $reportButton.data('userid');
  var link = $reportButton.data('entity-link');
  var type = $reportButton.data('entity-type');


  $reportButton.on('click', function (ev) {
    // Google Analytics function
    ga(['send', 'Video', 'Reported', 'Widgets']);
    mixpanel.track(
      'Video Reported',
      {
        'screen_type': screen,
        //'screen_name': screenType,
        'platform': navigator.platform,
        'entity_username': username,
        'entity_userid': userid,
        'entity_link': link,
        //'entity_type': type
      }
    );
    ev.preventDefault();
    app.utils.ajax.post('/report-abuse', {
      data: {
        id: id,
        type: postType
      }
    }).then(
      function (data) {
        Materialize.toast('Your report has been registered successfully. The ' + postType + ' has been reported.', 4000);
      },
      function (err) {
        Materialize.toast('Unable to report. Please try again later.', 4000);
      }
    );
  });
};
app.behaviors.requestAnswer = function ($requestBtn, isShare, $spanYou) {
  var buttonBehavior = function (state, requestUrl) {
    if (isShare) {
      $requestBtn.hide();
    }
    if (state === "request") {
      
      $requestBtn.addClass('success');
      $requestBtn.data('target', requestUrl.replace('request-answer', 'downvote-answer'));
      $requestBtn.data('state', 'downvote');
      $requestBtn.removeClass('sec');
      $requestBtn.html('<i class="icon-check"></i> Answer Requested');
      $requestBtn.removeClass("disabled");
      app.utils.btnStateChange($requestBtn, '<i class="icon-check"></i> Answer Requested', false);
      if (!isShare) {
        $spanYou.html('You, ');
      }

    } else if (state === "downvote") {
      
      $requestBtn.removeClass('success');
      $requestBtn.data('target', requestUrl.replace('downvote-answer', 'request-answer'));
      $requestBtn.data('state', 'request');
      $requestBtn.addClass('sec');
      $requestBtn.html('Request Answer');
      $requestBtn.removeClass("disabled");
      app.utils.btnStateChange($requestBtn, "Request Answer", false);
      if (!isShare) {
        $spanYou.html('');
      }
    }

    $requestBtn.fadeIn(100);
  };

  $requestBtn.on('click', function (ev) {
    //app.utils.btnStateChange($requestBtn, "Processing...", true);
    var requestUrl = $requestBtn.data('target');
    var state = $requestBtn.data('state');
    app.utils.ajax.post(requestUrl)
      .then(function () {
        ga(['send', 'Answer', 'Requested', 'Widgets']);
        buttonBehavior(state, requestUrl);
        if (isShare) {
          $requestBtn.trigger('share');
        }
      },
      function (xhr) {
        app.utils.btnStateChange($requestBtn, "Request Answer", false);
        if (xhr.status !== 401) {

        }
      });
  });

};
app.behaviors.shareBtn = function(shareSelector, $shareIcon){
  var share = new Share(shareSelector, {
    url: $shareIcon.data('url')
  });
  
  $shareIcon.hover(
    function(){
      share.open();
    },
    function(){
      share.close();
    }
  );
};
//Video play-pause functionality
app.behaviors.video = function ($video, attachClickBehavior) {

  /**
   * for mixPanel Data
   */
  var screen = app.$body.data('pagename');
  //var screenType = app.$body.data('userpage')
  var username = $video.data('username');
  var userid = $video.data('userid');
  var link = $video.data('entity-link');
  var type = $video.data('entity-type');

  if (attachClickBehavior !== false) {
    attachClickBehavior = true;
  }

  var videoComesWithSrc = $video.attr('src') !== undefined && $video.attr('src').indexOf('http') === 0;
  var uuid = $video.attr('data-uuid');
  var isPlaying = false;
  var isViewed = false;
  var page = app.$body.data('source');
  var isCropped = false;
  if ($video.data('record') === undefined && $video.attr('poster') === null) {
    $video.attr('poster', '/img/video_loader.gif');
  }
  //var adapter = playerjs.HTML5Adapter($video[0]);
  // // Start accepting events
  //adapter.ready();

  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  if (videoComesWithSrc) {
    if (url.indexOf('.mpd') >= 0) {
      // console.log('mpd');
      isMpd = true;
    }
  }

 // var context = new Dash.di.DashContext();
 // var player = new MediaPlayer(context);
 // if (isMpd && isDashSupported) {
 //   player.startup();
 //   player.attachView($video[0]);
 //   player.attachSource(url);
 // }

  $video.on('play', function (ev) {
    ga(['send', 'Video', 'Play', 'Widgets']);

    if (!isCropped) {
      isCropped = applyCropToFit();
      // isCropped = true;
    }

    // mixpanel.track(
    //   'Video Play',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );

    isPlaying = true;
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.utils.ajax.post('/view', {
        data: {
          vurl: $video.attr('src')
        }
      });
      mixpanel.track("Video played", {
        "Source": 'Widget'
      });
      isViewed = true;
    }
  });

  $video.on('pause', function (ev) {
    ga(['send', 'Video', 'Paused', 'Widgets']);
    // mixpanel.track(
    //   'Video Paused',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  $video.on('ended', function (ev) {
    ga(['send', 'Video', 'Ended', 'Widgets']);
    // mixpanel.track(
    //   'Video Ended',
    //   {
    //     'screen_type': screen,

    //     'platform': navigator.platform,
    //     'entity_username': username,
    //     'entity_userid': userid,
    //     'entity_link': link,
    //     //'entity_type': type
    //   }
    // );
    isPlaying = false;
  });

  if (attachClickBehavior) {
    $video.on('click', function (ev) {
      ga(['send', 'Videos', 'Clicked', 'Widgets']);
      if (isPlaying) {
        $video.trigger('pause');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
      } else {
        $video.trigger('play');
        $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('play');
      }
    });
  }

  //// video positioning etc
  var $videoHolder = $video.parent();
  var $videoContainer = $videoHolder.parent();
  var $cardContainer = $videoContainer.parent();

  var applyCropToFit = function () {
    // console.log($video[0].videoWidth , $video[0].videoHeight,'css');
    var cropToFit = $video.attr('data-crop-to-fit');
    if (cropToFit !== false && cropToFit !== undefined) {
      var squareVideo = $video.attr('data-square-video') !== false &&
        $video.attr('data-square-video') !== undefined;

      // height/width ratio
      var heightWidthRatio = squareVideo ? 1 : 16 / 9;

      var containerWidth = $videoContainer.width();
      if (containerWidth >= 280){
        containerWidth = $cardContainer.width();
      }
      // console.log($videoContainer.width());
      var containerHeight = squareVideo ? containerWidth : Math.floor(heightWidthRatio * containerWidth);

      $videoContainer.css({
        height: containerHeight,
        minHeight: containerHeight,
        minWidth: containerHeight,
        position: 'relative',
        overflow: 'hidden'
      });
      if (Math.round(((heightWidthRatio * $video[0].videoWidth) / $video[0].videoHeight) - .28) === 1 ) {
        var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
        $videoHolder.css({
          height: $videoContainer.height(),
          width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
          marginLeft: videoMargin
        });
        $video.css({height: '100%', width: '100%'});
      } else {
        var videoMargin = (containerHeight - ((containerWidth / $video[0].videoWidth) * $video[0].videoHeight)) / 2;
        $videoHolder.css({
          width: containerWidth,
          height: (containerWidth / $video[0].videoWidth) * $video[0].videoHeight,
          marginTop: videoMargin
        });
        if ($video[0].videoWidth == 318 && $video[0].videoHeight == 572) {
          var videoMargin = (containerWidth - ((containerHeight / $video[0].videoHeight) * $video[0].videoWidth)) / 2;
          $videoHolder.css({
            height: $videoContainer.height(),
            width: (containerHeight / $video[0].videoHeight) * $video[0].videoWidth,
            marginLeft: videoMargin
          });
        }

        $video.css({height: '100%', width: '100%'});
      }
    }
    if ($videoContainer.width() == 280 && $videoContainer.height() == 503) {
      $video[0].videoWidth = containerWidth;
      $video[0].videoHeight = $videoContainer.height();
    }

    return ($video[0].videoWidth > 0 ? true : false );

  };

  if ($videoHolder.hasClass('videoHolder') && $videoContainer.hasClass('videoContainer')) {
    $videoHolder.css({
      backgroundColor: '#fff',
      overflow: 'hidden'
    });

    $video.on('loadedmetadata', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
        //isCropped = true;
      }
    });

    $video.on('croptofit', function (ev) {
      if (!isCropped) {
        isCropped = applyCropToFit();
        //isCropped = true;
      }
    });
  }

  /**
   * Playing one video at a time
   */
  var autoPauseListener = function (ev, uuid) {
    if ($video.data('uuid') !== uuid) {
      var endedVideo = false;
      // $video.on('ended', function (ev){
      //   console.log("herererwerwer");
      //   endedVideo = true;
      // });
      if (!endedVideo) {
        $video.trigger('pause');
      }
      $video.siblings('audio').length > 0 && $video.siblings('audio').trigger('pause');
    }
  };

  app.vent.on('video-played', autoPauseListener);

  /**
   * tackling dynamic dom removal
   */
  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $video)) {
      app.vent.off('video-played', autoPauseListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};
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

app.components.askBox = function ($askBox) {

  var $postArea = $askBox.find('.postArea');
  var targetUrl = $askBox.data('target');
  var $askBtn = $askBox.find('.askBtn');


  $postArea.on('keyup', function (ev) {
    app.cache.userQuestion = $postArea.val();
  });

  // set postArea val to cache value
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
  }

  var formData = {
      question: {
        body: $postArea.val()
      }
    };

    $askBtn.on('click', function (ev) {
      if ($postArea.val().length >= 15 && $postArea.val().length <= 300) {
        if(!$postArea.val().trim())
        {
          Materialize.toast("Ask Something",2000);
        }
        else{
        app.utils.btnStateChange($askBtn, 'Asking', true);
        app.utils.ajax.post(targetUrl, {
          data: formData,
        }).then(

          function (data) {
            delete(app.cache.userQuestion);
            app.utils.btnStateChange($askBtn, 'Ask Question', false);
            Materialize.toast('Question Asked Successfully', 2000);
            setTimeout(function () { window.location.reload(); }, 2000);
          },
          function (xhr) {
            console.log(xhr);
          }
        );
        }
      } else {
        if ($postArea.val().length < 15) {
          Materialize.toast('Minimum length is 15', 4000);
        } else if (($postArea.val().length > 300)) {
          Materialize.toast("Maximum length is 300", 2000);
        }

      }
    });
    

  
};
app.components.askBtn = function ($card) {

  var $askBtn = $card.find('.askBtn');
  var url = $askBtn.data('url');
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').css('overflow', 'hidden');
  $('body').attr('class', '');
};
app.components.askPopup = function ($container) {

  var gettingRequest = false;

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = app.utils.domain();
    var trackedWindows = {};
    
    window.openUniquePopUp = function(path, windowName, specs) {
      trackedWindows[windowName] = false;
      var popUp = window.open(null, windowName, specs);
      popUp.postMessage('ping', openedDomain);
      setTimeout(checkIfOpen, 1000);
      setInterval(checkIfPinged, 1000);

      function checkIfOpen() {
        if (!trackedWindows[windowName]) {
          window.open(openedDomain + path, windowName, specs);
          popUp.postMessage('ping', openedDomain);
        }
      }

      function checkIfPinged() {
        popUp.postMessage('ping', openedDomain);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('message', onPingBackMessage, false);

    } else if (window.attachEvent) {
      window.attachEvent('message', onPingBackMessage, false);
    }

    function onPingBackMessage(event) {
      if (event.origin == openedDomain) {
        var winst = event.source;
        winst.close();
        Materialize.toast('Login Successfull!!', 4000, 'green lighten-2');
        postBtnHandler();
        $shareContainer.show();

        //app.utils.notify('Login Successfull!!', 'success', 10);
       // app.utils.reloadNavOnly();
      //  trackedWindows[event.data] = true;
      }
    };
  })();



  var addTrackingScriptsFacebook = function () {

    var scriptTag = (
      '<script id="fb-tracker">\n'+
        '(function () {\n'+
          'var _fbq = window._fbq || (window._fbq = []);\n'+
          'if (!_fbq.loaded) {\n'+
            'var fbds = document.createElement("script");\n'+
            'fbds.async = true;\n'+
            'fbds.src = "//connect.facebook.net/en_US/fbds.js";\n'+
            'var s = document.getElementsByTagName("script")[0];\n'+
            's.parentNode.insertBefore(fbds, s);\n'+
            '_fbq.loaded = true;\n'+
          '}\n'+
        '})();\n'+
        'window._fbq = window._fbq || [];\n'+
        'window._fbq.push(["track", "6024054435549", {value: "0.00", currency: "INR"}]);\n'+
      '</script>'
    );

    var noScriptTag = (
      '<noscript>\n'+
        '<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6024054435549&amp;cd[value]=0.00&amp;cd[currency]=INR&amp;noscript=1" />\n'+
      '</noscript>'
    );

    app.$document.find('head').prepend(scriptTag);
    $(noScriptTag).insertAfter(app.$document.find('#fb-tracker'));
      
  };  

  var addTrackingScriptsTwitter = function () {

    var scriptTag = (
      '<script id="twitter-head" src="//platform.twitter.com/oct.js" type="text/javascript">\n'+
      '</script>'
    );

    var scriptTag2 = (
      '<script id="twitter-tracker" type="text/javascript">\n'+
        'twttr.conversion.trackPid(\'l5zic\', { tw_sale_amount: 0, tw_order_quantity: 0 });\n'+
      '</script>'
    );

    var noScriptTag = (
      '<noscript>\n'+
        '<img height="1" width="1" style="display:none;" alt="" src="https://analytics.twitter.com/i/adsct?txn_id=l5zic&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0" />\n'+
        '<img height="1" width="1" style="display:none;" alt="" src="//t.co/i/adsct?txn_id=l5zic&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0" />\n'+
      '</noscript>'
    );
    
    app.$document.find('head').append(scriptTag);
    setTimeout( function() {$(scriptTag2).insertAfter(app.$document.find('#twitter-head')) }, 5000);
    setTimeout( function() {$(noScriptTag).insertAfter(app.$document.find('#twitter-tracker')) }, 5000);
      //$(noScriptTag).insertAfter(app.$document.find('#twitter-tracker'));
      
  };
/*  var $alertHook = $container.find('#alert-hook');

  var $video = $container.find('video.introVideo');
  var $videoOverlay = $container.find('.videoOverlay.introOverlay');
  var $videoEnded = $container.find('.videoEnded');
*/
  // weidth height balancing
/*  var $videoWrapper = $container.find('.video-wrapper-cir.intro-cir');
  var height = $videoWrapper.innerWidth();
  */
  /**
   * play profile video inside circular overlay
   */
  /*var isPlaying = false;
  var isViewed = false;
  var page = app.$body.data('source');
  var username = $video.data('username');
*/
/*  $videoOverlay.on('click', function() {
    if (!isPlaying) {
      $video.show(500);
      $video.trigger('click');
      $videoOverlay.fadeOut();
    }
  });

  var profile = false;
  if ($video.data('profile-status') === 1) {
    profile = true;
  }

  app.behaviors.video($video);

  app.$window.resize(function () {
    location.reload();
  });
*/



  /**
   * follow functionality
   */
/*
  var $followBtn = $container.find('.profile.followBtn');
  var profileFollow = false;
  if ($followBtn.data('profile') === true) {
    profileFollow = true;
  }

  $followBtn.on('user.followed', function (ev) {
    if (page === 'askPopup') {
      mixpanel.track(
      "Followed",
      { "Source": app.$body.data('source'),
        "User": $followBtn.data('username'),
        "Profile": profileFollow 
      }
      );
    }
  });

  $followBtn.on('user.unfollowed', function (ev) {
    if (page === 'askPopup') {
      mixpanel.track(
      "UnFollowed",
      { "Source": app.$body.data('source'),
        "User": $followBtn.data('username'),
        "Profile": profileFollow
      }
      );
    }
  });

  app.behaviors.followBtn($followBtn, $container.find('.profile.followersCount'));*/
  
  /**
   * post question on asking
   */

   
   
  // handle post submission
  var $askOverview = $container.find('.ask-overview');   /*first state*/
  var $questionContainer = $container.find('.other-questions'); /*other questions view*/
  var $askIntermediate = $container.find('.ask-intermediate'); /*register user view (form)*/
  var targetUrl = $container.data('target');

  var $profileHolder = $askOverview.find('.profile-holder');
  var $postArea = $askOverview.find('.postArea'); /*question input textarea*/
  var $anonContainer = $askOverview.find('.anon');
  var $anon = $askOverview.find('.anon > input');
  var $postAreaContainer = $askOverview.find('.post-area-container');
  var $postBtn = $askOverview.find('.postBtn'); /*post question if logged in*/
  var $postIntermediateBtn = $askOverview.find('.postIntermediateBtn'); /*go to register user view*/
  var $showQuestionBtn = $askOverview.find('.showQuestionBtn');
  //var $alertHook = $container.find('#alert-hook');
  var $shareContainer = $container.find('.share-question-container');
  var $discoverView = $container.find('.discover-view');
  

    /**
   * profile
   */
  var $profileIntroVideo = $profileHolder.find('.introVideo')
  app.behaviors.video($profileIntroVideo);
  


  /*$postArea.on('click focus', function (ev) {
    $postArea.addClass('active');
    $postArea.removeClass('rbr');
    $postArea.animate({height:'96px'},2).attr('rows','4');
    $container.find('.switch.tiny.round').fadeIn();
    $askOverview.find('panel').find('.small-3').addClass('s-ws-top');
    $showQuestionBtn.children().animate({marginTop: '0em'},"slow");
    $container.find('.pvbr').animate({width: '100%'},800);
    //$showQuestionBtn.animate({marginTop: '20em'},"slow");
    $profileHolder.fadeIn();
    
  });*/

/*
  $postArea.on('keyup', function (ev) {
    app.cache.userQuestion = $postArea.val();
  });
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
   
  }

  app.behaviors.textArea($postArea, $countDisplay, $askBtn, 225);*/

  $postIntermediateBtn.on('click', function (ev) {
    if ( (!/\S/.test($postArea.val())) || ($postIntermediateBtn.hasClass('disabled'))) {
      ev.preventDefault();
      Materialize.toast('ask something', 4000, 'red lighten-2');
      $postArea.addClass('rbr');
      return;
    } else if ($postArea.val().length <= 15 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      //app.utils.notify('Minimum question length is 15', 'error', 5);
      Materialize.toast('Minimum question length is 15', 4000, 'red lighten-2');

      return;
    } else if ($postArea.val().length > 300 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      //app.utils.notify('Maximum question length is 300', 'error', 5);
      Materialize.toast('Maximum question length is 300', 4000, 'red lighten-2');

      return;
    } else {
      $postIntermediateBtn.html("Asking...");
      $postIntermediateBtn.addClass("disabled");
      
      /*mixpanel.track("Question Started", {
        "Source": app.$body.data('source'), 
        "User": app.$body.data('profile')    
      });*/
    }
    //$askingArea.find('div:first-child').first().addClass('hide-for-small-only');
    $askOverview.slideUp("slow");
    $showQuestionBtn.fadeOut('slow');
    $questionContainer.fadeOut('slow');
    $askIntermediate.delay("slow").fadeIn("slow");
    //$askIntermediate.find('.askQuestionBody').html(($postArea.val().length>50)? $postArea.val().substring(0,30)+'... ' : $postArea.val() );
  });

  var postBtnHandler = function (ev) {
    if ( (!/\S/.test($postArea.val())) || $postBtn.hasClass('disabled')) {
      //ev.preventDefault();
      //$postArea.addClass('rbr');
      //app.utils.notify('Please ask a question.', 'error', 5);
      Materialize.toast('Please ask a question', 4000, 'red lighten-2');
      $postArea.addClass('rbr');

      return;
    } else if ($postArea.val().length <= 15 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      //app.utils.notify('Minimum question length is 15', 'error', 5);
      Materialize.toast('Minimum question length is 15', 4000, 'red lighten-2');

      return;
    }
    else if ($postArea.val().length > 300 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      //app.utils.notify('Maximum question length is 300', 'error', 5);
      Materialize.toast('Maximum question length is 300', 4000, 'red lighten-2');

      return;
    } else {
     /* mixpanel.track("Question Started", {
            "Source": app.$body.data('source'), 
            "User": app.$body.data('profile')    
          });*/
      $postBtn.html("Asking...");
      $postBtn.addClass("disabled");
      //var $anon = $container.find("input.anon");
      
      var formData = {
        question: {
          body: $postArea.val(),
          is_anonymous: $anon[0].checked
        }
      };

      app.utils.ajax.post(targetUrl, {
        data: formData,
      }).then(
        function (data) {
          var question = data.question;




    (function listenForPings(data) {
        var openerDomain = 'http://localhost:8000';
        console.log("child active");
        if (window.addEventListener) {
          window.addEventListener('message', onPingMessage, false);
        } else if (window.attachEvent) {
          window.attachEvent('message', onPingMessage, false);
        }

        function onPingMessage(event) {
          if (1)
            //var data =[{name: "aregee", "question_id": "123123123132"}];
            
            event.source.postMessage(data, event.origin);
        }
      })(question);

          /*mixpanel.track("Question added", {
            "Source": app.$body.data('source'), 
            "User": app.$body.data('profile'),
            "Question": $postArea.val()    
          });*/
          //$alertHook.delay(9000).fadeOut();
          //$alertHook.html('Your question is posted successfully')
          //app.utils.notify('Your question is posted successfully','success',2);
          Materialize.toast('Your question is posted successfully', 4000, 'green lighten-2')

          $askOverview.slideUp('slow');
          $askIntermediate.slideUp('slow');
          //$askingArea.slideUp('slow');
          $questionContainer.slideUp('slow');
          $shareContainer.attr("data-url", "http://frankly.me/" + data.question.to.username + "/" + data.question.slug);
          $shareContainer.delay('slow').slideDown('slow');
          $postBtn.html("Submit Question");
          $postBtn.removeClass("disabled");
          delete(app.cache.userQuestion);
      
          /* unload popup on question asked  to be removed if feeds are viewed */
          // setTimeout(function(){ window.close()}, 3000);
          /* user feeds for aske user popup success view  */

          //addTrackingScriptsFacebook();
         // addTrackingScriptsTwitter();
         // goog_report_conversion();

          /*
           * Share question on fb/twt/g+
           */
          
          var $shareQuestion = $shareContainer.find(".share-question");
          var shareUrl = 'http://frankly.me/' + question.to.username + '/' + question.slug ;
          var $fbShare = $shareQuestion.find(".share-fb");
          var $twtShare = $shareQuestion.find(".share-twt");
          var $gglShare = $shareQuestion.find(".share-ggl");

          $fbShare.on('click', function (ev) {
            ev.preventDefault();
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
          });

          $twtShare.on('click', function (ev) {
            ev.preventDefault();
            var shareText = question.body;
            window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left)
          });

          $gglShare.on('click', function (ev) {
            ev.preventDefault();
            window.open('https://plus.google.com/share?url=' + shareUrl, 'google', 'width='+w+',height='+h+',top='+top+',left='+left)
          });

        },
        function (xhr) {

        }
      );
    }
  };

/*   social login functionality
*/ 
  var $fb = $askIntermediate.find('.fb');
  var $twt = $askIntermediate.find('.twt');
  var $ggl = $askIntermediate.find('.ggl');

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  
  $fb.on('click', function (ev) {
    window.openUniquePopUp('/auth/facebook', 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'google', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  var $askerFormView1 = $askIntermediate.find('.asker-form-view-1');
  var $askerFormView2 = $askIntermediate.find('.asker-form-view-2');
  var $askerFormView3 = $askIntermediate.find('.asker-form-view-3');
  var $askerFormViewNextBtn = $askIntermediate.find('.asker-form-next-btn');

  var $registerBtn = $askIntermediate.find('.asker-submit-btn');
  var $loginBtn = $askIntermediate.find('.asker-login-btn');
  var $forgotBtn =$askIntermediate.find('.forgot-password-btn');
  var $askerName = $askIntermediate.find('.asker-name');
  var $askerEmail = $askIntermediate.find('.asker-email');
  var $askerPassword = $askIntermediate.find('.asker-password');
  var $skipShareBtn = $shareContainer.find('.skip-share-btn');


  $postBtn.on('click', function () {
    //$questionContainer.slideUp('slow');
    //$showQuestionBtn.slideUp('slow');
    //Materialize.toast('ask something', 4000, 'red');
        
    postBtnHandler();
  });

  $askerFormViewNextBtn.on('click', function () {
    formInput();
  });
  $askerEmail.keypress(function(e)
  {
    if(e.which==13){
      formInput();
    }
  })
  var formInput = function (ev) {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  
    
    if (!($askerEmail.val().match(mailformat))) {
      //app.utils.notify('Please enter right email', 'error', 5);
      Materialize.toast('Please enter valid email', 4000, 'red lighten-2');

      }
    else {
      $askerFormViewNextBtn.html("wait");
      $askerFormViewNextBtn.addClass("disabled");
      var formData = {
        email: $askerEmail.val(),
      };
        
      app.utils.ajax.post('/user/exists', {
        data: formData
      }).then(
        function (data) {
          $askerFormView1.slideUp();
          if (data.exists) {
            //$askerFormView2.hide();
            $askerFormView3.slideDown();      
          }
          else {
            $askerFormView2.slideDown();  
          }
        }); 
    }
    //$askerFormView1.slideUp();
    //$askerFormView2.slideDown();
  };

  $skipShareBtn.on('click', function (ev) {
    //$discoverView.removeClass('hide');
    $discoverView.show();
    $shareContainer.slideUp();
    $discoverView.slideDown();
    //app.components.userCard($container);
    var $userCard = $discoverView.find('.userContainer').toArray();
    $userCard.forEach(function(card) {
      var $container = $(card);
      app.components.userCard($container);
    });
  });

  $registerBtn.on('click', function (ev) {
      ev.preventDefault();
      $registerBtn.html('Asking...');
      $registerBtn.addClass('disabled');
      registerForm();
  });
  $askerName.keypress(function(e){
    if(e.which==13){
      $registerBtn.html('Asking...');
      $registerBtn.addClass('disabled');
      registerForm();
    }
  });
    /*var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var validEmail = re.test($askerEmail.val());
    if ($askerName.val() === "" || $askerEmail.val() === "" || !(validEmail)) {
      if (!validEmail) {
        //app.utils.notify('Please fill valid email address', 'error', 5);
        Materialize.toast('Please fill valid email address', 4000, 'red lighten-2');

      } else {
        //app.utils.notify('Please fill both the name and the email field.', 'error', 5);
      
      }
    } else {*/
      /*ev.preventDefault();
      $registerBtn.html('Asking...');
      $registerBtn.addClass('disabled');*/
    var registerForm =function(){
      var formData = {
        fullName: $askerName.val(),
        email: $askerEmail.val(),
      };
      
      app.utils.ajax.post('/auth/public/register', {
        data: formData
      }).then(
        function (data) {
          //app.utils.notify('Hi ' + data.user.name + ', welcome to frankly.me', 'success', 10);
          Materialize.toast('Hi ' + data.user.name, 4000, 'green');

          /*mixpanel.track(
          "Signup Completed",
            { "Source": app.$body.data('source'),
              "User": app.$body.data('profile')
            }
          );*/
          //mixpanel.identify(data.user.id);
          //app.utils.reloadNavOnly();
          postBtnHandler();
          
          
        },
        function (res) {
          $askerFormView2.slideUp();
          $askerFormView3.slideDown();
          app.vent.on('modal.opened', function() {
            mixpanel.track(
            "Login Triggered",
            { "Source": app.$body.data('source') }
            );
            mixpanel.identify(app.$body.data('id'));
            app.utils.notifyLogin("Welcome back to frankly.me. Please login to continue","success",3);
          });
        }
    )
  };


  $loginBtn.on('click', function (ev) {
    ev.preventDefault();
    //$loginBtn.html('Asking...');
    $loginBtn.addClass('disabled');
    loginForm();
  });
  $askerPassword.keypress(function(e)
  {
    if(e.which==13){
      //ev.preventDefault();
      //$loginBtn.html('Asking...');
      $loginBtn.addClass('disabled');
      loginForm();
    }
  });
  var loginForm =function(ev){
    var formData = {
      username: $askerEmail.val(),
      password: $askerPassword.val(),
    };
    
    app.utils.ajax.post('/auth/local', {
      data: formData
    }).then(
      function (data) {
        //app.utils.notify('Hi ' + data.user.name + ', welcome to frankly.me', 'success', 10);
        Materialize.toast('Hi ' + data.user.name + ', welcome to frankly.me',  4000, 'red lighten-2');

        app.utils.reloadNavOnly();
        postBtnHandler();
      },
      function (res) {
        //app.utils.notify('Something went wrong', 'error', 10);
        Materialize.toast('Wrong Password!', 4000, 'red lighten-2');

        $loginBtn.html('Login');
        $loginBtn.removeClass('disabled');
      }
    )
  };

  $forgotBtn.on('click', function (ev) {
    ev.preventDefault();
    var formData = {
      username: $askerEmail.val()
    };

    app.utils.ajax.post('/auth/reset-password', {
      data: formData
    }).then(
      function (data) {
        Materialize.toast('Password reset request sent. You\'ll receive an email shortly',5000);
      },
      function (res) {
        Materialize.toast('Something went wrong. Please try later',5000);
      }
    );
  });

  /*
   * Slide up/down function
   */
   $container.find('.t4').on('click', function (ev) {
     if ($container.find('input.asker-name').val() === "") {
       ev.preventDefault();
       app.utils.notify('Please enter your name.', 'error', 5);
       return;
     } else {
       mixpanel.track(
         "Name added",
         { "Source": app.$body.data('source'),
            "User": app.$body.data('profile'),
            "Name": $container.find('input.asker-name').val()
         }
      );
       $container.find('.t4').fadeOut();
       $container.find('.t5').slideUp("slow");
       $container.find('.t6').slideDown("slow");
       $container.find('.t7').delay(400).fadeIn();
     }
   });
   
   var clicked = false;
   $showQuestionBtn.click(function (ev){
    //$postArea.animate({height:'2.2em'},400).attr('rows','1');
   // $container.find('.switch.tiny.round').fadeOut();
   // $askOverview.find('panel').find('.small-3').removeClass('s-ws-top');
   // $askOverview.animate({top: '1.9em'}, 800).addClass('s-ws-top-p lg2bg').css('border-bottom','1px solid #dedede');
   /* if (clicked) {
      $questionContainer.delay(800).slideUp(1000);
      clicked = false;
    } else {
      $questionContainer.delay(800).slideDown(1000);
      clicked = true;
    }*/
    $profileHolder.slideUp('slow');
    //$postAreaContainer.removeClass('s12');
    $postAreaContainer.addClass('m8');
    $postBtn.parent().removeClass('s6');
    $postBtn.parent().addClass('s4');
    $postIntermediateBtn.parent().removeClass('s6');
    $postIntermediateBtn.parent().addClass('s4');
    $postArea.css({'padding': '0'});
    //$postArea.removeClass('materialize-textarea');
    $anonContainer.hide();
    $showQuestionBtn.slideUp();
    $postAreaContainer.parent().addClass('fix-postArea card-panel');
    $questionContainer.slideDown();
    //$showQuestionBtn.children().animate({marginTop: '0em'},"slow");
    //$container.find('.pvbr').animate({width: '70%'},800);
    //$showQuestionBtn.animate({marginTop: '12em'},"slow");
    // $showQuestionBtn.unbind('click', function (ev) {
    //   ev.preventDefault();
    // });
    if (!gettingRequest) {
        initGetQuestion();      
      }
  });

  $postArea.on('click', function() {
    $postAreaContainer.removeClass('m8');
    //$postAreaContainer.addClass('s12');
    $postBtn.addClass('right');
    $postIntermediateBtn.addClass('right');
    $postArea.css({'padding': '1.6rem 0'});
    $anonContainer.show();



  });

  /**
   * request answer functionality
   */
  /* var $requestAnswerBtn = $questionContainer.find('.request-answer-btn');
   $requestAnswerBtn.on('click', function (ev) {
    var requestUrl = $requestAnswerBtn.data('target');
    app.utils.ajax.post(requestUrl)
      .then(function () {
        if (isShare) {
          $requestAnswerBtn.trigger('share');
        }
      },
      function (xhr) {
        app.utils.btnStateChange($requestAnswerBtn, "Request Answer", false);
        if (xhr.status !== 401) {

        }
      });
   });

  */

  /*  discover view , users you may like 
  */
  var $viewProfileBtn = $discoverView.find('.view-profile-btn');
  var profileUrl = $viewProfileBtn.data('url');
  $viewProfileBtn.on('click', function() {
    window.open(profileUrl);
  });
  
  /*
   * Final Act
   */
 /* $shareContainer.find('[data-skip]').on('click', function () {
    $shareContainer.slideUp('slow');
    $askSuccess.slideDown('slow');
  });
*/
  /*
   * Google Event Tracking
   */
/*  $video.on('play', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Play', $video.attr('src')]);
  });
  $video.on('pause', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Pause', $video.attr('src')]);
  });
  $video.on('ended', function () {
    _gaq.push(['_trackEvent', 'Videos', 'Ended', $video.attr('src')]);
  });
*/
  /*
   * Scroll Event on question show
   */
  var questionOffset = $questionContainer.find('[data-offset-stats]').data('offset-stats') || 0;
  var questionUrl = $questionContainer.data('url');
  var initGetQuestion = function () {
    gettingRequest = true;
    app.utils.ajax.get(questionUrl, {
      data: {
        partials: ['question'],
        offset: questionOffset,
      }
    }).then(function (data) {
      var el = document.createElement('div');
      el.innerHTML = data.question;
      var $pager = $(el).find('[data-offset-stats]');
      var newOffset = $pager.data('offset-stats') || 0;
      $questionContainer.find('[data-offset-stats]').attr('data-offset-stats', newOffset);
      $(el).remove('[data-offset-stats]');
      $questionContainer.find('.questionFeeds').append(el.innerHTML);
      gettingRequest = false;
    });
  };
  
  app.$window.on('scroll', function () {
    if (app.utils.$elInViewport($container.find('.questionBottom'))) {
      if (!gettingRequest) {
        initGetQuestion();      
      }
    }
  });
}
app.components.askPopupQuestionCard = function ($container) {

  /**
   * request answer functionality
   */

  var $questionCard = $container.find('.question-card');
  var $requestBtn = $questionCard.find('.request-answer-btn');
  //var $spanYou = $container.find('.spanYou');
 // var $spanUpvotes = $container.find('.upvote-count');
  //var $upvoteText = $container.find('.upvoteText');
  //var upvotes = parseInt($spanUpvotes.html());
  var isShare = !($requestBtn.data('share') === undefined);
  app.behaviors.requestAnswer($requestBtn, isShare); 


 /* if(upvotes <= 0) {
    $upvoteText.hide();
  } else {
    $upvoteText.show();
  }*/

  /**
   * share functionality
   */
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  var $shareQuestion = $questionCard.find(".share-question");
  var shareUrl = $shareQuestion.data('url');
  var $fbShare = $shareQuestion.find(".share-fb");
  var $twtShare = $shareQuestion.find(".share-twt");
  var $gglShare = $shareQuestion.find(".share-ggl");

  $fbShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $twtShare.on('click', function (ev) {
    ev.preventDefault();
    var shareText = $shareQuestion.data('text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  $gglShare.on('click', function (ev) {
    ev.preventDefault();
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left)
  });

  /**
    * Report User Functionality
    */
  var $reportButton = $container.find('.report-user');
  //app.behaviors.report($reportButton);

  
};

app.components.askUserWidgetLarge = function ($card) {

  var $askBtn = $card.find('.askBtn');
  var $introVideo = $card.find('.introVideo');
  var $videoHolder = $introVideo.parent();
  var url = $askBtn.data('url');
  //app.behaviors.video($introVideo);
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var $introVideoImage = $introVideo.parent().find('img.userImg');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').attr('class', '');

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.hide();
    $introVideo.show();
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });
};

app.components.askUserWidgetSmall = function ($card) {

  var $askBtn = $card.find('.askBtn');
  var $ansBtn = $card.find('.ansBtn');
  var $ansThumb = $card.find('.ansThumb');
  var $introVideo = $card.find('.introVideo');
  var $videoHolder=$introVideo.parent();
  var url = $askBtn.data('url');
  //var slug = $ansThumb.data('url');
  //app.behaviors.video($introVideo);
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $ansThumb.on('click', function (ev) {
    var slug = $(this).data('url');
    window.open(slug , '', 'width=' + 300 + ',height=' + 520 + ',top=' + top + ',left=' + left);
  });
  $('body').attr('class', '');
  $('body').css('overflow', 'hidden');
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.hide();
    $introVideo.show();
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });
};

app.components.auditionPopup = function ($panel) {

  var $profileContainer = $panel.find('.profiles-list');
  var $nextBtn = $profileContainer.find('.next-btn');
  var createdBy = $panel.data('creater');
  var profileId;
  var targetUrl;

  app.AUDITIONPOPUP = (app.AUDITIONPOPUP === undefined)? {targetUrl: "", panel: $panel, createdBy: createdBy} : app.AUDITIONPOPUP;

  $nextBtn.on('click', function (ev) {
    ev.preventDefault();
    var $profile = $profileContainer.find('.profile:checked');
    profileId = $profile.val();
    app.AUDITIONPOPUP.targetUrl = $profile.data('url');
    targetUrl = app.AUDITIONPOPUP.targetUrl + '/form?partials[]=form';
    
    app.utils.ajax.get(targetUrl
    ).
    then(function(data) {
      if (data.status == 'applied') {
        var username = data.user.username;
        targetUrl = '/widgets/popup/question/' + username + '?partials[]=auditionQuestions';
        app.utils.ajax.get(targetUrl, {
        data: {
          author: app.AUDITIONPOPUP.createdBy,
          offset: 0,
          limit: 10
          }
        }).then(
        function (data) {
          app.AUDITIONPOPUP.panel.html(data.auditionQuestions);
        });    
      } else {
      $panel.html(data.form);
      }
    });
  });


};
app.components.auditionPopupForm = function ($panel) {

  var username = $panel.data('username');
  var $form = $panel.find('form');
  var $submitBtn = $form.find('.submit-btn');
  
  $form.on('submit', function (ev) {
    ev.preventDefault();
    $submitBtn.html('loading...');
    $submitBtn.addClass('disabled');
    var formData = app.utils.getFormData($form);
    formData = JSON.stringify(formData);
    formData = JSON.parse(formData);
    var targetUrl = app.AUDITIONPOPUP.targetUrl + '/apply'
    
    app.utils.ajax.post(targetUrl, {
      data: formData
    }).then(
    function (data) {
      targetUrl = '/widgets/popup/question/' + username + '?partials[]=auditionQuestions';
      
      app.utils.ajax.get(targetUrl, {
      data: {
        author: app.AUDITIONPOPUP.createdBy,
        offset: 0,
        limit: 10
        }
      }).then(
      function (data) {
        app.AUDITIONPOPUP.panel.html(data.auditionQuestions);
      },
      function (err) {
        $submitBtn.html('Proceed');
        $submitBtn.removeClass('disabled');
      }
      );
    });
  });
}
app.components.auditionQuestions = function ($panel) {

  var username = $panel.data('username');
  var $recorder = $panel.find('.popupRecorder');
  //var userId ;
  var targetUrl;
  //var profileId;
  var questionOnly = false;

  var left = (screen.width / 2) - (300 / 2);
  var top = (screen.height / 2) - (500 / 2);

  $recorder.on('click', function (ev) {
    openWin();
  });

  function openWin(){
    var recorderPopup=window.open($recorder.data('url'),'auditionRec', 'width=' + 310 + ',height=' + 550 + ',top=' + top + ',left=' + left);
    // Add this event listener; the function will be called when the window closes
    recorderPopup.onbeforeunload = function(){

      
      targetUrl = '/widgets/popup/question/' + username + '?partials[]=auditionQuestions';
      console.log(targetUrl);
      
      app.utils.ajax.get(targetUrl, {
      data: {
        author: app.AUDITIONPOPUP.createdBy,
        offset: 0,
        limit: 10
        }
      }).then(
      function (data) {
        app.AUDITIONPOPUP.panel.html(data.auditionQuestions);
      });
    }; 
    recorderPopup.focus();
  }

}



app.components.authModal = function ($modal) {

  var $divSocialLogin = $modal.find('.section-social');
  var $fb = $divSocialLogin.find('.btn-facebook');
  var $twt = $divSocialLogin.find('.btn-twitter');
  var $ggl = $divSocialLogin.find('.btn-google');
  var $buttonOpenEmail = $divSocialLogin.find('.button-open-email');
  var $divEmail = $modal.find('.section-email');
  var $buttonEmailNext = $modal.find('.button-email-next');
  var $divPassword = $modal.find('.section-password');
  var $divName = $modal.find('.section-name');
  var $buttonLogin = $divPassword.find('.button-login');
  var $inputEmail = $divEmail.find('.input-email');
  var $inputName = $divName.find('.input-name');
  var $buttonNameNext = $divName.find('.button-name-done')
  var $inputPassword = $divPassword.find('.input-password');
  var $buttonBack = $modal.find('.back-button');
  var $divforgetPassword = $modal.find('.section-password-recover');
  var $forgetLabel = $divPassword.find('.forget-password-label');
  var $inputforgetPassword = $divforgetPassword.find('.input-forget-password');
  var $buttonSendEmail = $divforgetPassword.find('.button-send-email');

  var delayTime = 600;
  var userAction = false;
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  var userLoginDetail = {
    username: null,
    password: null
  }

  $buttonSendEmail.on('click', function () {
    var email = $inputforgetPassword.val();
    var isEmailValid = regexEmailValidator.test(email);
    if (email){
      if (isEmailValid) {
        var formData = {
          username: email.trim()
        };
        app.utils.ajax.post('/auth/reset-password', {
          data: formData
        }).then(
          function (data) {
            Materialize.toast('Password reset request sent. You\'ll receive an email shortly', 2000);
            window.location.reload();
          },
          function (res) {
            Materialize.toast('Something went wrong. Please try again later', 2000);
          }
        );
      } else {
        Materialize.toast('Invalid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  $forgetLabel.on('click', function () {
    $divPassword.fadeOut('slow');
    $divforgetPassword.delay(delayTime).fadeIn('slow')
  });

  $buttonOpenEmail.on('click', function () {
    $divSocialLogin.fadeOut('slow');
    $divEmail.delay(delayTime).fadeIn('slow');
  });

  //Email Div functionality
  $buttonEmailNext.on('click', function () {
    if ($inputEmail.val()) {
      var emailId = $inputEmail.val();
      var isValidEmail = regexEmailValidator.test(emailId);
      if (isValidEmail) {
        app.utils.ajax.post('/widgets/user/exists', {
          data: {
            email: $inputEmail.val()
          }
        }).then(function (data) {
          userLoginDetail.username = data.email;
          if (data.exists) {
            userAction = data.exists;
            $divEmail.fadeOut('slow');
            $divPassword.delay(delayTime).fadeIn('slow');
          } else {
            $divEmail.fadeOut('slow');
            $divName.delay(delayTime).fadeIn('slow');
          }
        }, function (err) {
          Materialize.toast('Something went wrong', 4000);
        });
      } else {
        Materialize.toast('Enter Valid Email', 4000);
      }
    } else {
      Materialize.toast('Enter Email', 4000);
    }
  });

  //Name Div functionality
  $buttonNameNext.on('click', function () {
    if ($inputName.val()) {
      var isNameValid = regexNameValidator.test($inputName.val());
      if (isNameValid) {
        userLoginDetail['fullname'] = $inputName.val();
        $divName.fadeOut('slow');
        $divPassword.delay(delayTime).fadeIn('slow');
      } else {
        Materialize.toast('Invalid Input', 4000);
      }
    } else {
      Materialize.toast('Enter Name', 4000);
    }
  });

  //Login div functionality
  $buttonLogin.on('click', function () {
    if ($inputPassword.val()) {
      userLoginDetail.password = $inputPassword.val();
      var userDetailCount = Object.keys(userLoginDetail).length;
      if (userDetailCount === 2) {
        app.utils.ajax.post('/auth/local', {
          data: userLoginDetail
        }).then(function () {
            Materialize.toast('Login Successful', 2000);
            ga(['send', 'Authentication', 'LogIn', 'Widgets']);
            mixpanel.identify;
            var page = app.$body.data('page');
            if (page == 'userWidgetBatch') {
              app.utils.reloadNavAndPanelAndHeader();
            } else {
              app.utils.reloadNavAndPanel();
            }
            if (page == "openQuestionPage") {
              window.location.reload();
            }
            $('#frankly-auth-modal').closeModal();
          },
          function () {
            Materialize.toast('Incorrect Credentials', 4000);
          })

      } else if (userDetailCount === 3) {
        if ((userLoginDetail.password).length >= 6) {
          app.utils.ajax.post('/auth/register', {
            data: userLoginDetail
          }).then(function () {
              ga(['send', 'Authentication', 'SignUp', 'Widgets']);
              mixpanel.identify;
              Materialize.toast('SignUp Successful', 2000);
              goog_report_conversion();
              window.location.reload();
            },
            function () {
              Materialize.toast('Something went wrong', 4000);
            })
        } else {
          Materialize.toast('Password should be more than 6 characters', 4000);
        }
      }
    } else {
      Materialize.toast('Enter Password', 4000);
    }
  });

  /**
   * Back button functionality
   */
  $buttonBack.on('click', function () {
    if ($divEmail.is(':visible')) {
      $divEmail.fadeOut('slow');
      $divSocialLogin.delay(delayTime).fadeIn('slow');
    } else if ($divforgetPassword.is(':visible')) {
      $divforgetPassword.fadeOut('slow');
      $divPassword.delay(delayTime).fadeIn('slow');
    } else if ($divName.is(':visible')) {
      $divName.fadeOut('slow');
      $divEmail.delay(delayTime).fadeIn('slow');
    } else if ($divPassword.is(':visible')) {
      if (userAction) {
        $divPassword.fadeOut('slow');
        $divEmail.delay(delayTime).fadeIn('slow');
      } else {
        $divPassword.fadeOut('slow');
        $divName.delay(delayTime).fadeIn('slow');
      }
    }
  });

  var authSuccess = function (windowName) {
    console.log('here');
    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};

    $('#frankly-auth-modal').closeModal();
    var page = app.$body.data('page');
    if (page == "openQuestionPage") {
      window.location.reload();
    }

    //addTrackingScripts();
  };

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = app.utils.domain(); //'http://frankly.me'
    var trackedWindows = {};
    window.openUniquePopUp = function (path, windowName, specs) {
      trackedWindows[windowName] = false;
      var popUp = window.open(null, windowName, specs);
      popUp.postMessage('ping', openedDomain);
      setTimeout(checkIfOpen, 1000);
      setInterval(checkIfPinged, 1000);

      function checkIfOpen() {
        if (!trackedWindows[windowName]) {
          window.open(openedDomain + path, windowName, specs);
          popUp.postMessage('ping', openedDomain);
        }
      }

      function checkIfPinged() {
        popUp.postMessage('ping', openedDomain);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('message', onPingBackMessage, false);

    } else if (window.attachEvent) {
      window.attachEvent('message', onPingBackMessage, false);
    }

    function onPingBackMessage(event) {
      console.log('ping to auth');
      if (event.origin == openedDomain) {
        var winst = event.source;
        winst.close();
        authSuccess();
        trackedWindows[event.data] = true;
      }
    };
  })();

  /**
   * Social login
   */

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var url = '/discover';
  $fb.on('click', function (ev) {
    //window.openUniquePopUp('/auth/facebook', 'facebook', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    


    url = '/auth/facebook';       
    openWin(url, 'facebook');       

  

  });
  $twt.on('click', function (ev) {
    //window.openUniquePopUp('/auth/twitter', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    url = '/auth/twitter';
    openWin(url, 'twitter');
  });
  $ggl.on('click', function (ev) {
    //window.openUniquePopUp('/auth/google', 'google', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    url = '/auth/google';
    openWin(url, 'google');  
  });


  function openWin(url, name){
    var loginPopup=window.open(url,'loginPopup', 'width=' + 700 + ',height=' + 480 + ',top=' + top + ',left=' + left);
    var interval = setInterval(function () {
      console.log(loginPopup.location.pathname);
      if(loginPopup.location.pathname == '/auth/success') {
        clearInterval(interval);
        loginPopup.close();
        authSuccess();
      }
    }, 4000);
    // Add this event listener; the function will be called when the window closes
    loginPopup.onbeforeunload = function(){

    console.log('before load');
    authSuccess();    

    }; 
    
    loginPopup.focus();
  }

};
app.components.batchHeader = function($header) {
  // var $navBarFixed = $('.navbar-fixed');
  var $askBtn = $header.find('.askBtn');
  var $userPicture = $header.find('.user-picture');
  var $mainFollow = $header.find('.main-follow');
  var $followBtn = $header.find('.followBtn');
  var $myButton = $('.my-button');
  var $video = $header.find('.introVideo');
  //app.behaviors.video($video);
  var $videoHolder = $video.parent();
  var $introVideoImage = $video.parent().find('img.userImg');
  var url = $askBtn.data('url');
  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  // $navBarFixed.hide();


var croptofitTriggered1 = false;
var croptofitTriggered2 = false;
  $(window).scroll(function() {
    //var bool = (500 + $(window).height() <= $(document).height());
     if($(window).scrollTop() > 200){
      $(".always-fixed-navbar").show();
      $(".fix-header").attr('style','visibility: hidden;');
        //avd $mainFollow.addClass('main-follow-fixed');
        //avd $userPicture.addClass('user-picture-fixed');
        //avd $userPicture.attr('style','width:70px;');  
        //$userFollow.addClass('user-follow-fixed');
        //avd $userFollowCss.addClass('user-follow-fixed');
        //avd $myButton.addClass('my-button-fixed');
        //avd $('.user-about-fixed').hide();
        //avd $('.user-information').addClass('user-information-fix');
        //app.behaviors.video($video);
        // $video.trigger('croptofit');
        setTimeout(function () {
        $video.parent().attr('style', '');
        $video.parent().parent().attr('style', '');
        var width = $videoHolder.parent().parent().width();
        $videoHolder.css("height", width);
        app.behaviors.video($video);
        $video.trigger('croptofit');
      }, 1000);

       }else{
          $(".fix-header").attr('style','visibility: visible;');
          $(".always-fixed-navbar").hide();
           //avd $mainFollow.removeClass('main-follow-fixed'); 
           //avd $userPicture.removeClass('user-picture-fixed');
           //avd $userPicture.attr('style','width:150px;'); 
           //$userFollow.removeClass('user-follow-fixed');
           //avd $userFollowCss.removeClass('user-follow-fixed');
           //avd $myButton.removeClass('my-button-fixed');
           //avd $('.user-information').removeClass('user-information-fix');
           //avd $('.user-about-fixed').show();
           // app.behaviors.video($video);
           // $video.trigger('croptofit');
           setTimeout(function () {
             var width = $videoHolder.parent().parent().width();
             $videoHolder.css("height", width);
             app.behaviors.video($video);
             $video.trigger('croptofit');
           }, 1000);
       }

  });
  $askBtn.on('click', function (ev) {
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
   $introVideoImage.on('click', function () {
    $introVideoImage.hide();
    $video.show();
    app.behaviors.video($video);
    $video.trigger('click');
  });

  var $followBtnCount = $header.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followBtnCount);


};
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


app.components.openAnswerCard = function($answerCard) {

  var $answerVideo = $answerCard.find('.answerVideo');
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
  var $replayBtn = $answerBlank.find('.replay-video-icon');
  var videoEnded = false;


  // var $videoHolder = $introVideo.parent();
  // var $introVideoImage = $introVideo.parent().find('img.userImg');  
 
  var user_id = $answerVideo.data('user-id');

  // app.behaviors.video($introVideo);

  $answerFirst.on('click',function (){
    $answerVideo.trigger('play');
    $videoContainer.attr('style','display:block;');
    $answerFirst.css("display",'none');
    app.behaviors.video($answerVideo, true);
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
    videoEnded = false;
  });

  $answerVideo.on('ended',function (){
    videoEnded = true;
    $answerPaused.css('display','none');
    $answerBlank.css('display','block');
  });

  $CommentPopup.on('click',function(){

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
    $answerBlank.css('display','none');
    $videoContainer.css('display','block');
    $answerPaused.css('display','none');
    $answerVideo.trigger('click');
    videoEnded = false;
  });


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
app.components.openQuestion = function ($card) {

  var $introVideo = $card.find('.introVideo');
  var $answerVideo = $card.find('.answerVideo');
  var $viewAll = $card.find('.viewAll');
  var $questionCardContent = $card.find('.question-card-content');
  var $recorder = $card.find('.popupRecorder');
  var $meAnswerPopup = $card.find('.popupAnswer');
  app.behaviors.video($introVideo);
  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);

  $('body').attr('class', '');

  $answerVideo.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 320 + ',height=' + 530 + ',top=' + top + ',left=' + left);
  });

  $meAnswerPopup.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 400 + ',height=' + 580 + ',top=' + top + ',left=' + left);
  });
    
  $viewAll.on('click', function (ev){

    if ($(this).data('flag-redirect')){
      window.top.location.href = $(this).data('parentUrl');
    } else{
      window.open($(this).data('url'));
    }
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('url'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });

  /*
   * Share question on fb/twt/g+
   */
  var $fbShare = $card.find(".facebook-icon");
  var $twtShare = $card.find(".twitter-icon");
  var $gglShare = $card.find(".google-icon");
  var shareUrl = $questionCardContent.attr('data-url');
   
  
  $fbShare.on('click', function () {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $twtShare.on('click', function () {
    var shareText = $twtShare.attr('data-text');
    window.open('https://twitter.com/intent/tweet?text=' + shareText + '&url=' + shareUrl, 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  $gglShare.on('click', function () {
    window.open('https://plus.google.com/share?url=' + shareUrl, 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

};
app.components.openQuestionHolder = function ($feedHolder) {
  var $loadMoreBtn = $feedHolder.find('.load-more-btn');
  var $feedEnd = $feedHolder.find('.feed-end');
  var $loadLessBtn = $feedHolder.find('.load-less-btn');
  var $feed = $feedHolder.find('.feed');
  var offset = $feedEnd.attr('data-post-index');

   $loadMoreBtn.on('click', function (ev) { 
    var pageUrl = app.utils.currentUrl(true);
    $feed.css({'width' : $feed.width()  * 1.1});
    window.scrollBy(500, 0);
    if (offset == -1) {
      //$loadMoreBtn.hide();
      //Materialize.toast('no more comments to load !', 4000, 'red lighten-2')
    } else {
      app.utils.ajax.get(pageUrl, {
          data: {
            offset: offset
          }
        }).then(
        function (data) {
          var div = document.createElement('div');
          var $div = $(div);
          $div.html(data);
          $feedHolder.find('ul#video').append($div.find('ul#video').html());
          $feedEnd.attr('data-post-index', $div.find('.feed-end').attr('data-post-index'));
        });
      };
    });
   $loadLessBtn.on('click', function (ev) {
    window.scrollBy(-500, 0);
  });
};
app.components.openQuestionPage = function ($page) {
  var $introVideo = $page.find('.introVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $addImage = $page.find('.addImage');
  var $editBtn = $page.find('.editBtn');
  var $upload = $page.find('.upload');
  var $newImage = $page.find('.static-page');
  var questionId = $page.data('question-id'); 

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });

  var $recorder = $page.find('.popupRecorder');
  var left = (screen.width / 2) - (300 / 2);
  var top = (screen.height / 2) - (500 / 2);
  $recorder.on('click', function (ev){
    ev.preventDefault();
    window.open($(this).data('url'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });

  var $followBtn = $page.find('.followBtn');
  app.behaviors.followBtn($followBtn);
  var $pageBanner = $page.find('.pageBanner');
  var $openQuestionHeaderFixed = $page.find('.openQuestionHeaderFixed');
  //console.log($openQuestionHeaderFixed.hide(),'here1');
  $openQuestionHeaderFixed.hide();
  //console.log("here");
/*  $(window).scroll(function() {
      if($(window).scrollTop() > 200){
        
        $openQuestionHeaderFixed.show();
       }
       else{
        $pageBanner.show();
        $openQuestionHeaderFixed.hide();
       }

  });*/
  $editBtn.on('click',function(ev){
    $upload.css('display','block');
    $editBtn.css('display','none');
  });

  $upload.on('click',function(){
    $editBtn.css('display','block');
    $upload.css('display','none');
 

  });
  $addImage.on('change', function () {

  var image = $addImage[0].files[0];


  var formdata = new FormData();
  formdata.append('image', image);
  formdata.append('questionId', questionId);
     app.utils.ajax.post('/widgets/imageUplaod', {
        data: formdata,
        processData: false,
        contentType: false  
      }).then(
        function (data) {
          window.location.reload();  

        },
        function (err) {
        });

    });
}
app.components.profileHeader = function ($card) {
	 var $video = $card.find('.introVideo');
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
  });

  var $followBtn = $card.find('.followBtn');
  var $followersCount = $card.find('.followers-count');
  app.behaviors.followBtn($followBtn, $followersCount);
};
  

app.components.questionCard = function($questionCard) {

  var $introVideo = $questionCard.find('.qustionCardIntroVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $recorder = $questionCard.find('.recordBtn');

  var w = 700;
  var h = 600;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    $introVideo.trigger('click');
    $introVideo.trigger('play');
    app.behaviors.video($introVideo);
  });

  $recorder.on('click', function (ev){
    window.open($(this).data('target'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });
   /**
   * request answer functionality
   */
  var $requestBtn = $questionCard.find('.requestBtn');
  var isShare = !($requestBtn.data('share') === undefined);

  app.behaviors.requestAnswer($requestBtn, isShare);


  var $reportButton = $questionCard.find('.report-user');
  app.behaviors.report($reportButton);



}

app.components.stdFeedHolder = function ($feedHolder) {

  var $feedEnd = $feedHolder.find('.feed-end');
  var working = false;
  var done = false;
 

  var loadMore = function () {
    if (! working && ! done) {
      working = true;

      $feedEnd.html(app.utils.preloaderHtml());
      var questionIndex = parseInt($feedEnd.data('question-index'));
      questionIndex = isNaN(questionIndex) ? 0 : questionIndex;
      var postIndex = parseInt($feedEnd.data('post-index'));
      postIndex = isNaN(postIndex) ? 0 : postIndex;
      var userIndex = parseInt($feedEnd.data('user-index'));
      userIndex = isNaN(userIndex) ? 0 : userIndex;
      var pageUrl = app.utils.currentUrl(true);
      if (postIndex >= 0 ) {
      app.utils.ajax.get(pageUrl, {
          data: {
            questionIndex: isNaN(questionIndex) ? 0 : questionIndex,
            postIndex: isNaN(postIndex) ? 0 : postIndex,
            userIndex: isNaN(userIndex) ? 0 : userIndex, 
            partials: ['feed']
          }
        })
        .then(function (partials) {
          // extracting feedDiv without using jquery
          // so that script tags remain intact
          var el = document.createElement('div');
          el.innerHTML = partials.feed;
          var $feedDiv = $(el).find('.feed');
          var $elFeedEnd = $(el).find('.feed-end');

          if ($feedDiv[0].childElementCount > 0) {
            $feedHolder.find('.feed').append($feedDiv.html());

            $feedEnd.data('question-index', $elFeedEnd.data('question-index'));
            $feedEnd.data('post-index', $elFeedEnd.data('post-index'));
            $feedEnd.data('user-index', $elFeedEnd.data('user-index'));
          } else {            
            $feedEnd.replaceWith('');
            done = true;
          }

          working = false;
            
        }, function (res) { console.log(res); });

      } else {
        $feedEnd.replaceWith('');
      }
    }
  };




  var scrollListener = function () {
    if (app.utils.$elInViewport($feedEnd) && ! done && ! working) {
      loadMore();
    }
  };

  app.$window.on('scroll', scrollListener);

  var domNodeRemovalListener = function (ev) {
    if (app.utils.$elRemoved(ev, $feedHolder)) {
      app.$window.off('scroll', scrollListener);
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);

  // call a load more as soon as feed gets rendered
  //loadMore();

};
app.components.userCard = function ($container) {
  var $userCard = $container.find('.user-card');
  var $introVideo = $userCard.find('.introVideo');
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $videoHolder = $introVideo.parent();
  var $followBtn = $userCard.find('.followBtn');

  app.behaviors.followBtn($followBtn);
  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });

  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
    
  });
}

app.components.videoComment = function ($panel) {
  
  var $commentBtn = $panel.find('.commentBtn');
  var sourceUrl = $commentBtn.data('url');
  var count = $panel.data('count');




  if (count == 0) {
    var interval = setInterval(function () {
      location.reload();
      if(count == 1) {
        clearInterval(interval);
      }
    }, 5000);
  };

  var w = 300;
  var h = 500;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $commentBtn.on('click', function (ev) {
    window.open(sourceUrl, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').css('overflow', 'hidden');
  $('body').attr('class', '');
};
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
app.components.videoCommentHolder = function ($panel) {
  var $loadMoreBtn = $panel.find('.load-more-btn') || 'www.test.com';
  var sourceUrl = $panel.data('url');
  var $commentCard = $panel.find('.commentCard');
  var $loadLessBtn = $panel.find('.load-less-btn');
  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  if (isSafari) {
    $panel.hide();
  }

  $loadMoreBtn.on('click', function (ev) {
    console.log(sourceUrl);
    var targetUrl = '/widgets/viewComment?url=' + sourceUrl ;
    var $offset = $panel.find('.checkLimit');
    var offset = $offset.attr('data-offset');

    $commentCard.css({'width' : $commentCard.width()  * 1.1});
    window.scrollBy(500, 0);

     if (offset == -1) {
      //$loadMoreBtn.hide();
      //Materialize.toast('no more comments to load !', 4000, 'red lighten-2')
    } else {
      app.utils.ajax.get(targetUrl, {
      data: {
        offset: offset,
        }
      }).then(
      function (data) {
        var div = document.createElement('div');
        var $div = $(div);
        $div.html(data);
        $panel.find('ul#video').append($div.find('ul#video').html());
        $offset.attr('data-offset', $div.find('.checkLimit').attr('data-offset'));
      });
    };
  });
  $loadLessBtn.on('click', function (ev) {
    window.scrollBy(-500, 0);
  });
}

app.components.videoComment = function ($panel) {

  var $commentBtn = $panel.find('.commentBtn');
  var sourceUrl = $commentBtn.data('url');
  var count = $panel.data('count');


  var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
  if (isSafari) {
    document.getElementsByClassName("videoComment")[0].style.display = "none";
  }

  if (count == 0) {
    var interval = setInterval(function () {
      location.reload();
      if(count == 1) {
        clearInterval(interval);
      }
    }, 5000);
  };

  var w = 300;
  var h = 500;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $commentBtn.on('click', function (ev) {
    window.open(sourceUrl, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').css('overflow', 'hidden');
  $('body').attr('class', '');
};

app.components.widgetAudition = function ($card) {

  var $auditionBtn = $card.find('.giveAuditionBtn');
  var url = $auditionBtn.data('url');
  var w = 570;
  var h = 380;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  $auditionBtn.on('click', function (ev) {
    ev.preventDefault();
    window.open(url, '', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $('body').attr('class', '');
};