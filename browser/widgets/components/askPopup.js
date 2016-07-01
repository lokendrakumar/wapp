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