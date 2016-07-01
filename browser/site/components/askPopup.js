app.components.askPopup = function ($container) {

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = 'http://frankly.me'; //app.utils.domain();
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
        app.utils.notify('Login Successfull!!', 'success', 10);
        app.utils.reloadNavOnly();
        trackedWindows[event.data] = true;
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
        'window._fbq.push(["track", "6026480256749", {value: "0.00", currency: "INR"}]);\n'+
      '</script>'
    );

    var noScriptTag = (
      '<noscript>\n'+
        '<img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?ev=6026480256749&amp;cd[value]=0.01&amp;cd[currency]=INR&amp;noscript=1" />\n'+
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
  var $alertHook = $container.find('#alert-hook');

  var $video = $container.find('video.introVideo');
  var $videoOverlay = $container.find('.videoOverlay.introOverlay');
  var $videoEnded = $container.find('.videoEnded');

  // weidth height balancing
  var $videoWrapper = $container.find('.video-wrapper-cir.intro-cir');
  var height = $videoWrapper.innerWidth();
  
  /**
   * play profile video inside circular overlay
   */
  var isPlaying = false;
  var isViewed = false;
  var page = app.$body.data('source');
  var username = $video.data('username');

  $videoOverlay.on('click', function() {
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


  /**
   * follow functionality
   */

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

  app.behaviors.followBtn($followBtn, $container.find('.profile.followersCount'));
  /**
   * post question on asking
   */

  // handle post submission
  var $askOverview = $container.find('.ask-overview');
  var $askSuccess = $container.find('.ask-success');
  var $askIntermediate = $container.find('.ask-intermediate');
  var targetUrl = $container.data('target');
  var $askingArea = $container.find('.ask-process');

  var $postArea = $askOverview.find('.postArea');
  var $postBtn = $askOverview.find('.postBtn');
  var $countDisplay = $askOverview.find('.countDisplay');
  var $postIntermediateBtn = $askOverview.find('.postIntermediateBtn');
  
  $postArea.on('click focus', function (ev) {
    $postArea.addClass('active');
    $postArea.removeClass('rbr');
    $countDisplay.delay(1000).fadeIn();
  });

  $postArea.on('keyup', function (ev) {
    app.cache.userQuestion = $postArea.val();
  });
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
   
  }

  app.behaviors.textArea($postArea, $countDisplay, $postBtn, $postIntermediateBtn, 25);

  $postIntermediateBtn.on('click', function (ev) {
    if ($postArea.val().length === 0 || $postIntermediateBtn.hasClass('disabled')) {
      ev.preventDefault();
      $postArea.addClass('rbr');
      return;
    } else if ($postArea.val().length <= 15 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      app.utils.notify('Minimum question length is 15', 'error', 5);
      return;
    } else {
      $postIntermediateBtn.html("Asking...");
      $postIntermediateBtn.addClass("disabled");
      
      mixpanel.track("Question Started", {
        "Source": app.$body.data('source'), 
        "User": app.$body.data('profile')    
      });
    }
    $askingArea.find('div:first-child').first().addClass('hide-for-small-only');
    $askOverview.slideUp("slow");
    $askIntermediate.delay("slow").slideDown("slow");
    $askIntermediate.find('.askQuestionBody').html(($postArea.val().length>50)? $postArea.val().substring(0,30)+'... ' : $postArea.val() );
  });

  
  var postBtnHandler = function (ev) {

    if ($postArea.val().length === 0 || $postBtn.hasClass('disabled')) {
      ev.preventDefault();
      $postArea.addClass('rbr');
      app.utils.notify('Please ask a question.', 'error', 5);
      return;
    } else if ($postArea.val().length <= 15 || $postBtn.hasClass('disabled')) {
      $postArea.addClass('rbr');
      app.utils.notify('Minimum question length is 15', 'error', 5);
      return;
    } else {
      mixpanel.track("Question Started", {
            "Source": app.$body.data('source'), 
            "User": app.$body.data('profile')    
          });
      $postBtn.html("Asking...");
      $postBtn.addClass("disabled");
    
      var formData = {
        question: {
          body: $postArea.val(),
          is_anonymous: false,
          widget: true
        }
      };

      app.utils.ajax.post(targetUrl, {
        data: formData,
      }).then(
        function (data) {
          var question = data.question;
          mixpanel.track("Question added", {
            "Source": app.$body.data('source'), 
            "User": app.$body.data('profile'),
            "Question": $postArea.val()    
          });
          $alertHook.delay(9000).fadeOut();
          //$alertHook.html('Your question is posted successfully')
          app.utils.notify('Your question is posted successfully','success',2);
          // $askOverview.slideUp('slow');
          // $askIntermediate.slideUp('slow');
          $askingArea.slideUp('slow');
          $askSuccess.delay('slow').slideDown('slow');
          $postBtn.html("Submit Question");
          $postBtn.removeClass("disabled");
          delete(app.cache.userQuestion);
      
          /* unload popup on question asked  to be removed if feeds are viewed */
          // setTimeout(function(){ window.close()}, 3000);
          /* user feeds for aske user popup success view  */

          addTrackingScriptsFacebook();
          addTrackingScriptsTwitter();
          goog_report_conversion();

        },
        function (xhr) {
          console.log(xhr);
        }
      );
    }
  };

  var $fb = $container.find('.fb');
  var $twt = $container.find('.twt');
  var $ggl = $container.find('.ggl');

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  
  $fb.on('click', function (ev) {
    window.openUniquePopUp('/auth/facebook', 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'twitter', 'width='+w+',height='+h+',top='+top+',left='+left);
  });

  var $registerBtn = $askIntermediate.find('.asker-submit-btn');
  var $loginBtn = $askIntermediate.find('.asker-login-btn');
  var $askerName = $askIntermediate.find('.asker-name');
  var $askerEmail = $askIntermediate.find('.asker-email');
  var $askerPassword = $askIntermediate.find('.asker-password');
  $postBtn.click(postBtnHandler);

  $registerBtn.on('click', function (ev) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var validEmail = re.test($askerEmail.val());
    if ($askerName.val() === "" || $askerEmail.val() === "" || !(validEmail)) {
      if (!validEmail) {
        app.utils.notify('Please fill valid email address', 'error', 5);
      } else {
        app.utils.notify('Please fill both the name and the email field.', 'error', 5);
      }
    } else {
      ev.preventDefault();
      $registerBtn.html('Submitting Question...');
      $registerBtn.addClass('disabled');
      var formData = {
        fullName: $askerName.val(),
        email: $askerEmail.val(),
      };
      
      app.utils.ajax.post('/auth/public/register', {
        data: formData
      }).then(
        function (data) {
          app.utils.notify('Hi ' + data.user.name + ', welcome to frankly.me', 'success', 10);
          mixpanel.track(
          "Signup Completed",
            { "Source": app.$body.data('source'),
              "User": app.$body.data('profile')
            }
          );
          mixpanel.identify(data.user.id);
          app.utils.reloadNavOnly();
          postBtnHandler();
          
          
        },
        function (res) {
          app.utils.loadModal('#authModal', '/modal/auth');
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
    }
  });


  $loginBtn.on('click', function (ev) {
    ev.preventDefault();

    var formData = {
      username: $askerEmail.val(),
      password: $askerPassword.val(),
    };
    
    app.utils.ajax.post('/auth/local', {
      data: formData
    }).then(
      function (data) {
        app.utils.notify('Hi ' + data.user.name + ', welcome to frankly.me', 'success', 10);
        app.utils.reloadNavOnly();
        postBtnHandler();
      },
      function (res) {
        app.utils.notify('Something went wrong', 'error', 10);
      }
    )
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
}
