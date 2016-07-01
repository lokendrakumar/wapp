'use strict';


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
       $('#frankly-auth-modal').openModal(
         {
           dismissible: false
         }
       );
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

app.utils.reloadNavAndPanel = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav', 'panel']}
  }).then(function () {
    //$(document).foundation();
  });
};

app.utils.reloadNavOnly = function () {
  app.utils.ajax.get(app.utils.currentUrl(true), {
    data: {partials: ['nav']}
  }).then(function () {
    $(document).foundation();
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
  var imgHtml =  '<img src="/img/preloader.gif" class="left"/>'+
                  '<div class="inBtnState">'+
                  '</div>';
  
  
  if (disabled) {
    $button.addClass('fullbtn');
    $button.html(imgHtml);
    var $inBtnState = $button.find('.inBtnState');
    $inBtnState.html(message);
    
    $button.addClass('disabled');
  } else {
    $button.removeClass('fullbtn');
    $button.removeClass('disabled');    
    $button.html(message);
  }

};

app.utils.requestSerializer = function (method, url, params) {
  app.requestArgs.method = method;
  app.requestArgs.url = url;
  app.requestArgs.params = params;
}

var getParameterByName = function (name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

app.utils.requestDeserializer = function (args) {
  app.utils.ajax(args.method, args.url, args.params);
  var resourceId = getParameterByName('resourceId');
  var type = getParameterByName('type');
  if (args.url.indexOf('me') > -1) {
    app.utils.ajax.get('/recorder/recorder', {
      data: {
        partials: ['shareCard']
      }
    }).then(function (data) {
      var $shareCard = $(data.shareCard);
      $shareCard.find('.shareContainer').data("question-id", resourceId);
      $shareCard.find('.shareContainer').data("type", type);

      app.$body.html($shareCard[0]);
      //$card.find('.shareContainer').data("question-id", resourceId) ;
      //console.log( $card.find('.shareContainer').data("question-id"))

    });
  }
  // app.utils.reloadNavAndPanel();
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
//Video play-pause functionality
app.behaviors.video = function($video, attachClickBehavior) {


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
    $video.attr('poster','/img/video_loader.gif');
  }


  var isMpd = false;
  var isDashSupported = $video.data('dash');
  var url = $video.attr('src');

  $video.on('play', function (ev) {
    isPlaying = true;
    app.vent.trigger('video-played', $video.data('uuid'));
    if (!isViewed && videoComesWithSrc) {
      $video.trigger("video.playing");
      app.utils.ajax.post('/view', {
        data: {
          vurl: $video.attr('src'),
        }
      });
      isViewed = true;
    }
  });

  $video.on('pause ended', function (ev) {
    isPlaying = false;
  });

  if (attachClickBehavior) {
    $video.on('click', function (ev) {
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

  var applyCropToFit = function () {
    
    var cropToFit = $video.attr('data-crop-to-fit');
    if (cropToFit !== false && cropToFit !== undefined) {
      var squareVideo = $video.attr('data-square-video') !== false &&
                        $video.attr('data-square-video') !== undefined;

      // height/width ratio
      var heightWidthRatio = squareVideo ? 1 : 16/9;
      console.log('cropppedtofit');
      var containerWidth = $videoContainer.width();
      var containerHeight = squareVideo ? containerWidth : heightWidthRatio * containerWidth;

      $videoContainer.css({
        height: containerHeight,
        minHeight: containerHeight,
        position: 'relative',
        overflow: 'hidden'
      });
      
      if ((heightWidthRatio * $video[0].videoWidth) >= $video[0].videoHeight) {
        var videoMargin = (containerWidth - ((containerHeight/$video[0].videoHeight) * $video[0].videoWidth)) / 2;
        $videoHolder.css({
          height: $videoContainer.height(),
          width: (containerHeight/$video[0].videoHeight) * $video[0].videoWidth,
          marginLeft: videoMargin
        });

        $video.css({height: '100%', width: '100%', zIndex: -1});
      } else {
        var videoMargin = (containerHeight - ((containerWidth/$video[0].videoWidth) * $video[0].videoHeight)) / 2;
        $videoHolder.css({
          width: $videoContainer.width(),
          height: (containerWidth/$video[0].videoWidth) * $video[0].videoHeight,
          marginTop: videoMargin
        });

        $video.css({height: '100%', width: '100%'});
      }
    }
  };
  console.log($videoHolder.hasClass('videoHolder'));
  console.log($videoContainer.hasClass('videoContainer'));
  if ($videoHolder.hasClass('videoHolder') && $videoContainer.hasClass('videoContainer')) {
    $videoHolder.css({
      backgroundColor: '#fff',
      overflow: 'hidden'
    });

    $video.on('loadedmetadata', function (ev) {
      if (!isCropped) {
        applyCropToFit();
        isCropped = true;
      }
    });

    $video.on('croptofit', function (ev) {
      console.log('force');
      if (!isCropped) {
        applyCropToFit();
        isCropped = true;
      }
    });
  }

  /**
   * Playing one video at a time
   */
  var autoPauseListener = function (ev, uuid) {
    if ($video.data('uuid') !== uuid) {
      $video.trigger('pause');
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
  var delayTime = 400;
  var userAction = false;
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;


  var addTrackingScriptsFacebook = function () {

    var scriptTag = (
    '<script id="fb-tracker">\n' +
    '(function () {\n' +
    'var _fbq = window._fbq || (window._fbq = []);\n' +
    'if (!_fbq.loaded) {\n' +
    'var fbds = document.createElement("script");\n' +
    'fbds.async = true;\n' +
    'fbds.src = "//connect.facebook.net/en_US/fbds.js";\n' +
    'var s = document.getElementsByTagName("script")[0];\n' +
    's.parentNode.insertBefore(fbds, s);\n' +
    '_fbq.loaded = true;\n' +
    '}\n' +
    '})();\n' +
    'window._fbq = window._fbq || [];\n' +
    'window._fbq.push(["track", "6026480256749", {value: "0.01", currency: "INR"}]);\n' +
    '</script>'
    );

    var noScriptTag = (
    '<noscript>\n' +
    '<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6026480256749&amp;cd[value]=0.01&amp;cd[currency]=INR&amp;noscript=1" />\n' +
    '</noscript>'
    );

    app.$document.find('head').prepend(scriptTag);
    $(noScriptTag).insertAfter(app.$document.find('#fb-tracker'));

  };

  var userLoginDetail = {
    username: null,
    password: null
  }

  $buttonOpenEmail.on('click', function () {
    $divSocialLogin.fadeOut();
    $divEmail.delay(delayTime).fadeIn();
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
            $divPassword.delay(delayTime).fadeIn();
          } else {
            $divEmail.fadeOut('slow');
            $divName.delay(delayTime).fadeIn();
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

  var authSuccess = function (windowName) {
    function getParameterByName(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    var type = getParameterByName('type');
    var resourceId = getParameterByName('resourceId');

    var pageUrl = app.utils.currentUrl(true);


    app.utils.ajax.get(pageUrl, {
      data: {
        partials: ['shareCard']
      }
    })
      .then(function (data) {
        var $shareCard = $(data.shareCard);
        $shareCard.find('.shareContainer').data("question-id", resourceId);
        $shareCard.find('.shareContainer').data("type", type);
        app.$body.html($shareCard[0]);
      },
      function (err) {
        console.log(err);
      });
  }

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
            //window.location.reload();
            app.utils.requestDeserializer(app.requestArgs);
            var page = app.$body.data('page');
            if (page == 'userWidgetBatch') {
              app.utils.reloadNavAndPanelAndHeader();

            } else {
              app.utils.reloadNavAndPanel();
            }
            $('#frankly-auth-modal').closeModal();
          },
          function () {
            Materialize.toast('Incorrect Credentials', 4000);
          })

      } else if (userDetailCount === 3) {
        app.utils.ajax.post('/auth/register', {
          data: userLoginDetail
        }).then(function () {
            app.utils.requestDeserializer(app.requestArgs);
            goog_report_conversion();
            Materialize.toast('SignUp Successful', 2000);
            addTrackingScriptsFacebook();
            $('#frankly-auth-modal').closeModal();
            // window.location.reload();
          },
          function () {
            Materialize.toast('Something went wrong', 4000);
          })
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

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = app.utils.domain();

    var trackedWindows = {};
    var wName;
    window.openUniquePopUp = function (path, windowName, specs) {
      trackedWindows[windowName] = false;
      var popUp = window.open(null, windowName, specs);
      popUp.postMessage('authping', openedDomain);
      setTimeout(checkIfOpen, 1000);
      setInterval(checkIfPinged, 1000);
      wName = windowName;
      function checkIfOpen() {
        if (!trackedWindows[windowName]) {
          window.open(openedDomain + path, windowName, specs);
          popUp.postMessage('authping', openedDomain);
        }
      }

      function checkIfPinged() {
        popUp.postMessage('authping', openedDomain);
      }
    };

    if (window.addEventListener) {
      window.addEventListener('message', onPingBackMessage, false);

    } else if (window.attachEvent) {
      window.attachEvent('message', onPingBackMessage, false);
    }

    function onPingBackMessage(event) {
      if (event.origin == openedDomain && event.data === wName) {
        var winst = event.source;
        winst.close();
        authSuccess(event.data);
        trackedWindows[event.data] = true;
        $('#frankly-auth-modal').closeModal();
        var page = app.$body.data('page');
        if (page == "openQuestionPage") {
              window.location.reload();
        }
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

  $fb.on('click', function (ev) {
    window.openUniquePopUp('/auth/facebook', 'recFacebookAuth', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'recTwitterAuth', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'recGoogleAuth', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
}

app.components.recorder = function ($card) {

  var $video = $card.find('video');
  var $audio = $card.find('audio');
  var $recordBtn = $card.find('.recordBtn');
  var $countdown = $card.find('#countdown');
  var type = $card.data('type');
  var resourceId = $card.data('resource');
  var sourceUrl = $card.data('page-url');
  var widget = $card.data('widget');
  var $continueBtn = $card.find('.continue');
  var $continueBtnHolder = $card.find('.continueHolder');
  var $reject = $card.find('.reject');
  var recordedOnce = false;
  var formData;
  var onMobile = parseInt($card.data('onmobile')) === 1;
  var pageUrl = app.utils.currentUrl(true);
  var recorder;
  var streamOut;
  var timeUp = false;
  var blobs = {
    audio: null,
    video: null,
    mediaSize: null
  };

  var $attachVideo = $card.find(".attachButton");
  var $attachVideoFile = $card.find('.attachedVideo');
  var audioSrc;
  var videoSrc;
  var attachVideo = false;
  formData = new FormData();
  var $inputMobile;
  if (onMobile) {
    $inputMobile = $card.find('input[name="answerVideoRecord"]');
  }
  app.$window.on('load', function () {
    if (onMobile) {
      $inputMobile.trigger("click");
    } else {
      $recordBtn.trigger('record');
    }
  });

  if (onMobile) {
    $inputMobile.on('click', function (ev) {
      //$recordBtn.trigger('stop');
    });
    $inputMobile.on('change', function (ev) {
      var $input = $(ev.currentTarget);
      var video = $input[0].files[0];
      blobs.video = video;
      if (video === undefined) {
        return;
      }

      if (video.size > (40 * 1024 * 1024)) {
        alert('files greater than 40MB not allowed');
        return;
      }

      if (video.duration > 90) {
        alert('Video duration is greater than 90 seconds');
        return;
      }
      $recordBtn.trigger('stop');
    });
  }

  $recordBtn.on('record', function (ev) {
    ev.preventDefault();
    $continueBtnHolder.hide();
    $recordBtn.show();

    if (onMobile) {
      ev.preventDefault();
      return;
    }
    navigator.getUserMedia({video: true, audio: true}, function (stream) {
      streamOut = stream;
      $video[0].volume = 0;
      $video.attr('src', window.URL.createObjectURL(stream));
      app.behaviors.video($video);
      $recordBtn.on('click', function (ev) {
        ev.stopPropagation();
        $attachVideo.hide();
        $card.find('.circleText').html('Stop');
        $video.trigger('croptofit');
        if (!recordedOnce) {
          recorder = new MultiStreamRecorder(stream);
          recorder.start(92 * 1000);
          ////////////////////////////////////////
          var secondsPassed = 0;
          recordedOnce = true;
          var timePlayedInterval = setInterval(function () {
            secondsPassed += 1;
            var minutes = Math.floor(secondsPassed / 60);
            var seconds = Math.floor(secondsPassed % 60);

            seconds = seconds.toString().length === 1 ? '0' + seconds : seconds;

            if (secondsPassed === 90) {
              // trigger the pausing click
              $recordBtn.trigger('stop');
            }
          }, 1000);

          var time = 90;
          /* how long the timer runs for */
          var initialOffset = '195';
          var i = 1;
          var interval = setInterval(function () {
            $('.circle_animation').css('stroke-dashoffset', initialOffset - (i * (initialOffset / time)));
            if (i === (time)) {
              clearInterval(interval);
            }
            i++;

          }, 1000);

          recorder.ondataavailable = function (data) {
            blobs.audio = app.utils.blobToFile(data.audio, 'recordAudio');
            blobs.video = app.utils.blobToFile(data.video, 'recordVideo');
            //blobs.audio = data.audio;
            //blobs.video = data.video;
            blobs.size = data.audio.size + data.video.size;
           // console.log(blobs.audio, 'total size');
            if (navigator.mozGetUserMedia) {
              // console.log("mozilla");
              formData.append('audio', null);
            } else {
              formData.append('audio', blobs.audio);
            }

            formData.append('video', blobs.video);
            audioSrc = URL.createObjectURL(blobs.audio);
            videoSrc = URL.createObjectURL(blobs.video);

          };

        } else {
          $recordBtn.trigger('stop');
        }
      });

    }, function (err) {
      alert('Allow your webcam to record the video');

    });

  });

  $recordBtn.on('stop', function () {
    if (!onMobile && !attachVideo) {
      recorder.stop();
      streamOut.stop();

    }

    
    //var videoSrc = URL.createObjectURL(blobs.video);
    //var audioSrc = URL.createObjectURL(blobs.audio);
    var mobileRecorder = function () {

      $card.find('.mobileFirstScreen').hide();
      $card.find('.mobileUploadScreen').show();

      var continueBtn = function () {
        $video.attr('src', videoSrc);
        $audio.attr('src', audioSrc);
        $video.removeAttr('autoplay');
        $audio.removeAttr('autoplay');
        if (widget) {
          formData.append('widgets', true);
        } else {
          formData.append('widgets', false);
        }
        if (type === 'blog' && sourceUrl) {
          formData.append('caption', 'Video Comment');
          formData.append('page_url', sourceUrl);
          app.utils.ajax.post('/me/create-video', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("question-id", resourceId);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);
                //$card.find('.shareContainer').data("question-id", resourceId) ;
                //console.log( $card.find('.shareContainer').data("question-id"))

              });  
              console.log('Successfully added'); 
             //window.close();
            }, 
            function (err) {
              window.close();
              console.log(err);
            }
          );
        }else if (type === 'blog') {
          formData.append('caption', resourceId);
          app.utils.ajax.post('/me/create-video', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
             window.close();
            }, function (err) {
             window.close();
              console.log(err);
            }
          );
        } else if (type === 'question' && resourceId) {
          formData.append('questionId', resourceId);
          app.utils.ajax.post('/me/upload-answer', {
            data: formData,
            processData: false,
            contentType: false,
            widgets: widget ? widget : false
          }).then(
            function (data) {
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("question-id", resourceId);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);
                //$card.find('.shareContainer').data("question-id", resourceId) ;
                //console.log( $card.find('.shareContainer').data("question-id"))

              });
              console.log("Successfully added");
            },
            function (err) {
              // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
              // $uploadAttachedVideo.html('Add Video');
              // $uploadAttachedVideo.removeClass('disabled');
              // $cancelVideo.removeClass('disabled');
            }
          );
        } else {
          app.utils.ajax.post('/me/update-profile', {
            data: formData,
            processData: false,
            contentType: false
          }).then(
            function (data) {
              //console.log(data);
              //get share card
              app.utils.ajax.get(pageUrl, {
                data: {
                  partials: ['shareCard']
                }
              }).then(function (data) {
                var $shareCard = $(data.shareCard);
                $shareCard.find('.shareContainer').data("type", type);

                $card.html($shareCard[0]);

                //$card.html(data.shareCard);
              });
              console.log("Successfully added");

            },
            function (err) {
              // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
              // $uploadAttachedVideo.html('Add Video');
              // $uploadAttachedVideo.removeClass('disabled');
              // $cancelVideo.removeClass('disabled');
            }
          );
        }
      };

      continueBtn();
    }

    if (onMobile) {
      mobileRecorder();
      $inputMobile.off('change');
    }
    if (!attachVideo) {
      $recordBtn.hide();
      $countdown.hide();
      $continueBtnHolder.show();
    }
    // $reject.show();
    $reject.on('click', function () {
      window.location.reload();

    });
    $continueBtn.on('click', function (ev) {
      $card.find('.mobileUploadScreen').show();
      $video.attr('src', videoSrc);
      $audio.attr('src', audioSrc);
      $video.removeAttr('autoplay');
      $audio.removeAttr('autoplay');
      $video[0].pause();

      if (widget) {
        formData.append('widgets', true);
      } else {
        formData.append('widgets', false);
      }
      $continueBtnHolder.hide();
      if (sourceUrl) {
        formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'Video Comment'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'blog') {
        console.log('creating', type);
        //formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'check out my this post'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'question' && resourceId) {
        formData.append('questionId', resourceId);
        app.utils.ajax.post('/me/upload-answer', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              //console.log(data.shareCard);
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      } else {
        app.utils.ajax.post('/me/update-profile', {
          data: formData,
          processData: false,
          contentType: false,
          widgets: widget ? widget : false
        }).then(
          function (data) {
            //console.log(data);
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);

              //$card.html(data.shareCard);
            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      }
    });

    $video.attr('src', videoSrc);
    $audio.attr('src', audioSrc);

    $video[0].play();
    $audio[0].play();

  });
  
  $attachVideo.on('click', function (ev) {
    ev.preventDefault();
    $attachVideoFile.show();
    $attachVideoFile.trigger('click');
  });

  $attachVideoFile.on('change', function (ev) {
    ev.preventDefault();
    $attachVideo.hide();
    $recordBtn.hide();
    var $input = $(ev.currentTarget);
    blobs.video = $input[0].files[0];
    blobs.size = $input[0].files[0].size;    
    formData.append('audio', null);
    formData.append('video', blobs.video);
    attachVideo = true;
    $recordBtn.trigger('stop');
    var upload = function () {
      $card.find('.mobileUploadScreen').show();
      $video.attr('src', videoSrc);
      $audio.attr('src', audioSrc);
      $video.removeAttr('autoplay');
      $audio.removeAttr('autoplay');
      if (widget) {
        formData.append('widgets', true);
      } else {
        formData.append('widgets', false);
      }
      $continueBtnHolder.hide();
      if (sourceUrl) {
        formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'Video Comment'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'blog') {
        console.log('creating', type);
        //formData.append('page_url', sourceUrl);
        formData.append('captionText', (resourceId || 'check out my this post'));
        app.utils.ajax.post('/me/create-video', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            var shortId = data;
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);
              $shareCard.find('.shareContainer').data("short-id", shortId);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log('Successfully added from Comment continue');    
           //window.close();
          }, function (err) {
            console.log(err);
          }
        );
      } else if (type == 'question' && resourceId) {
        formData.append('questionId', resourceId);
        app.utils.ajax.post('/me/upload-answer', {
          data: formData,
          processData: false,
          contentType: false
        }).then(
          function (data) {
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              //console.log(data.shareCard);
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("question-id", resourceId);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);
              //$card.find('.shareContainer').data("question-id", resourceId) ;
              //console.log( $card.find('.shareContainer').data("question-id"))

            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      } else {
        app.utils.ajax.post('/me/update-profile', {
          data: formData,
          processData: false,
          contentType: false,
          widgets: widget ? widget : false
        }).then(
          function (data) {
            //console.log(data);
            //get share card
            app.utils.ajax.get(pageUrl, {
              data: {
                partials: ['shareCard']
              }
            }).then(function (data) {
              var $shareCard = $(data.shareCard);
              $shareCard.find('.shareContainer').data("type", type);

              $card.html($shareCard[0]);

              //$card.html(data.shareCard);
            });
            console.log("Successfully added");
          },
          function (err) {
            // app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
            // $uploadAttachedVideo.html('Add Video');
            // $uploadAttachedVideo.removeClass('disabled');
            // $cancelVideo.removeClass('disabled');
          }
        );
      }
    }
    if (blobs.size > (40 * 1024 * 1024)) {
      alert('files greater than 40MB not allowed');
      window.location.reload();
    } else {
      upload();
    }
      
  });
  
}
app.components.shareCard = function ($card) {


  //var permissions = {facebook:false, twitter:false, youtube:false};
  var $shareIcon = $card.find('.shareIcon');
  var $fb = $card.find('.facebook-icon');
  var $twt = $card.find('.twitter-icon');
  //var $ytb = $card.find('.youtube-icon');
  var $shareContainer = $card.find('.shareContainer');
  var $mainShareButton = $card.find('.mainShareButton');
  var $closeBtn = $card.find('.close-btn');

  $("<style type='text/css'> .selectedShare {background-color: #EF5350 !important;border-radius: 2px;padding: 2px;} .notSelectedShare {background-color: #AEACAC !important;border-radius: 2px;padding: 2px;} .link {cursor: pointer;cursor: hand; }  </style>").appendTo("head");


  (function initializeOpenUniquePopUp() {
      //set this to domain name
      var openedDomain = app.utils.domain();
      var wName;
      var trackedWindows = {};
      window.openUniquePopUp = function (path, windowName, specs) {
        trackedWindows[windowName] = false;
        var popUp = window.open(null, windowName, specs);
        popUp.postMessage(windowName, openedDomain);
        setTimeout(checkIfOpen, 1000);
        setInterval(checkIfPinged, 1000);
        wName = windowName;
        function checkIfOpen() {
          if (!trackedWindows[windowName]) {
            window.open(openedDomain + path, windowName, specs);
            popUp.postMessage(windowName, openedDomain);
          }
        }

        function checkIfPinged() {
          popUp.postMessage(windowName, openedDomain);
        }
      };

      if (window.addEventListener) {
        window.addEventListener('message', onPingBackMessage, false);

      } else if (window.attachEvent) {
        window.attachEvent('message', onPingBackMessage, false);
      }

      function onPingBackMessage(event) {
        console.log("hola1", event.data, event.origin, openedDomain);
        if (event.origin == openedDomain && event.data === wName) {
          console.log("ping",event.data, event.origin, openedDomain);
          var winst = event.source;
          winst.close();
          //authSuccess(event.data);
          trackedWindows[event.data] = true;
        }
      };
    })();

  //get facebook and twitter share permissions
  var getPermissions = function (callback) {
    app.utils.ajax.get('/user/profile').then(
      function (data) {
        var userPermissions = {
          "facebook": data.user.facebook_write_permission? true:false,
          "twitter": data.user.twitter_write_permission ? true:false,
          "youtube": data.user.youtube_write_permission? true:false,
          "google": true
        };
        callback(userPermissions);
      },
      function (err) {

      }
    );
  };

  //set background of share buttons according to permissions
  var selectShareButtonsAccordingToPermissions = function (userPermissionsFromAjaxCall) {

    var w = 500;
    var h = 280;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);

    //automatically select icons if write permissions already given else ask for permission on click
    if (userPermissionsFromAjaxCall.facebook) {
      $fb.addClass('selectedShare');
    }

    $fb.on('click', function (ev) {
      if (!$fb.hasClass('selectedShare')) {
        window.openUniquePopUp('/auth/facebook', 'facebookPermission', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
      }
      $(this).toggleClass("selectedShare");
    });

    if (userPermissionsFromAjaxCall.twitter) {
      $twt.addClass('selectedShare');
    }

    $twt.on('click', function (ev) {
      if (!$twt.hasClass('selectedShare')) {
        window.openUniquePopUp('/auth/twitter', 'twitterPermission', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
      }
      $(this).toggleClass("selectedShare");
    });

    /*if(userPermissionsFromAjaxCall.youtube){
     $ytb.addClass('selectedShare');
     }
     else{
     $ytb.on('click', function (ev) {
     if(!$ytb.hasClass('selectedShare')){
     window.openUniquePopUp('/auth/google', 'google', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
     }
     $(this).toggleClass("selectedShare");
     });
     }*/
  };
  //get permissions and then select appropriate buttons to share
  getPermissions(selectShareButtonsAccordingToPermissions);


  var questionId = $shareContainer.data('question-id');
  var userId = $shareContainer.data('user-id');
  var type = $shareContainer.data('type');
  var shortId = $shareContainer.data('short-id');


  $mainShareButton.on('click', function () {

    var shareFb = $fb.hasClass('selectedShare');
    var shareTwt = $twt.hasClass('selectedShare');
    //var shareYtb = $ytb.hasClass('selectedShare');

    var data = {};
    //if question
    if (type === 'question') {
      data = {post_to_question: questionId, facebook_post: shareFb, twitter_post: shareTwt};
    }
    else if (type == 'blog') {
      data = {blog_short_id: shortId, facebook_post: shareFb, twitter_post: shareTwt};
    } else {
      data = {user_id: userId, facebook_post: shareFb, twitter_post: shareTwt};
    }
    app.utils.ajax.post('/social/post', {data: data})
      .then(function (response) {
        window.close();
      },
      function (err) {
        window.close();
      });

  });

  $closeBtn.on('click', function(ev) {
    ev.preventDefault;
    window.close();
  });

}
