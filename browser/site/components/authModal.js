app.components.authModal = function ($modal) {

  var authMessage = function (text, type, duration) {

    $('#authModalMessage').fadeIn().addClass(type).html(text + '<a href="#" class="auth close">&times;</a>');
    
    //Types are: alert, success, warning, info 
    if (duration != 0) {
      setTimeout(function () {
        $('#authModalMessage').removeClass(type).fadeOut().html('loading <a href="#" class="auth close">&times;</a>');
      }, duration * 1000);
    }

  }
  
  var authSuccess = function (windowName) {
    app.utils.unloadModal($modal.parent());
    app.utils.notify('Success !!', 'success', 10);
    var page = app.$body.data('source');
    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};
    if (page === 'askPopup') {
      mixpanel.track(
        "Login Successful",
        {
          "Source": app.$body.data('source'),
          "User": app.$body.data('profile'),
          "Method": windowName
        }
      );
    }
    // (function listenForPings() {
    //   var openerDomain = 'http://frankly.me';
    //   if (app.$body.data('from')) {
    //     openerDomain = app.$body.data('from');
    //   }
    //   console.log(openerDomain,'od');
    //   console.log(app.$body.data('from'));
    //   console.log("child active");
    //   if (window.addEventListener) {
    //     window.addEventListener('message', onPingMessage, false);
    //   } else if (window.attachEvent) {
    //     window.attachEvent('message', onPingMessage, false);
    //   }

    //   function onPingMessage(event) {
    //     if (event.origin == openerDomain)
    //       event.source.postMessage(app.$body.data('profile'), event.origin);
    //   }
    // })();

    console.log(app.$body.data('from'));
    if(app.$body.data('from')){
       app.utils.redirect(app.$body.data('from')+'?username='+app.$body.data('from'));
       return;
    }
    if (app.utils.currentUrl() === app.utils.domain() + '/') {
      app.utils.redirectTo('/discover');
    } else {
      app.utils.reloadNavAndPanel();
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
      //if (event.origin == openedDomain) {
        var winst = event.source;
        winst.close();
        authSuccess(event.data);
        trackedWindows[event.data] = true;
      //}
    };
  })();
  
  var $loginTrg = $modal.find('#loginTrg');
  var $signupTrg = $modal.find('#signUpTrg');
  var $loginForm = $modal.find('#loginForm');
  var $signupForm = $modal.find('#signupForm');
  var $loginDisplay = $modal.find('#loginDisplay');
  var $signupDisplay = $modal.find('#signupDisplay');
  var $hideIfForm = $modal.find('.hide-if-form');
  var $showIfForm = $modal.find('.show-if-form');
  var $socialBtn = $modal.find('#socialBtn');
  var $loginBtn = $loginForm.find('#login-btn');
  var $registerBtn = $signupForm.find('#register-btn');
  var $fb = $socialBtn.find('.fb');
  var $twt = $socialBtn.find('.twt');
  var $ggl = $socialBtn.find('.ggl');
  var $backBtn = $modal.find('.frankly-back');
  var backBtnHtml = '<div class="scolor2 s cs">Back</div>';
  var $forgotPasswordBtn = $modal.find('.forgot-password');
  var $authModal = $modal.find('.authModalClass');
  var $forgotPasswordDisplay = $modal.find('.forgotPasswordDisplay');
  var $sendMailButton = $modal.find('.sendEmailButton');
  var $forgotPasswordEmailInput = $modal.find('.forgotPasswordEmailInput');
  var $backBtnForgotPassword = $modal.find('.back-button-forgot-password');
  var $normalBackDiv = $modal.find('.normal-back');
  var $forgotPasswordBackDiv = $modal.find('.forgot-password-back');
  var $invalidEmailUsernameMessage = $modal.find('.invalidEmailUsernameMessage');
    
  var addErrorMessage = function(field,errorSpan){
      errorSpan.slideDown('slow');
      //on keydown remove the message
      field.keydown(function(){
      errorSpan.slideUp('slow');
    });
  };

  $loginBtn.on('click', function (ev) {

    // ev.preventDefault();
    app.utils.btnStateChange($loginBtn, "Signing In", true);

    var formData = {
      username: $loginForm.find('#email').val(),
      password: $loginForm.find('#password').val()
    };
        
     var re = /^[ A-Za-z0-9]*$/i;
     var validUsername = re.test($loginForm.find('#email').val());   

     var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
     var validEmail = re.test($loginForm.find('#email').val());

     if(!validUsername&&!validEmail){
        app.utils.btnStateChange($loginBtn, "Sign In", false);
        addErrorMessage($loginForm.find("#email"),$invalidEmailUsernameMessage)
        return;
     }

  
    if (!$loginForm[0].checkValidity()) {
      app.utils.btnStateChange($loginBtn,"Sign In",false);
      return;
    }
    
    

    app.utils.ajax.post('/auth/local', {
      data: formData
    }).then(
      function (data) {
        mixpanel.identify(data.user.id);
        authSuccess('native');
      },
      function (res) {
        app.utils.btnStateChange($loginBtn, "Sign In", false);
        authMessage('Something went wrong', 'error', 10);
      }
    )
  });

  $registerBtn.on('click', function (ev) {
    // ev.preventDefault();

    app.utils.btnStateChange($registerBtn, "Signing Up", true);

    var formData = {
      username: $signupForm.find('#email').val(),
      password: $signupForm.find('#password').val(),
      fullName: $signupForm.find('#name').val()
    };
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var validEmail = re.test($signupForm.find('#email').val());

    if (!$signupForm[0].checkValidity()) {
      app.utils.btnStateChange($registerBtn,"Create New Account",false);
      return;
    }

    if (!validEmail) {
      app.utils.notifyLogin('Please fill valid email address', 'error', 5);
      app.utils.btnStateChange($registerBtn,"Create New Account",false);
      return;
    }
    app.utils.btnStateChange($registerBtn,"Signing Up",true);
    app.utils.ajax.post('/auth/register', {
      data: formData
    }).then(
      function (data) {
        if (app.$body.data('source') === 'askPopup') {
          mixpanel.track(
            "Signup Completed",
            {
              "Source": app.$body.data('source'),
              "User": app.$body.data('profile')
            }
          );
        }
        mixpanel.identify(data.user.id);
        authSuccess();
      },
      function (res) {
        app.utils.btnStateChange($registerBtn, "Create New Account", false);
        authMessage('Something went wrong', 'error', 10);
      }
    )
  });

  $forgotPasswordBtn.on('click', function (ev) {
    ev.preventDefault();
    $loginDisplay.slideUp();
    $normalBackDiv.delay(100).slideUp();
    $forgotPasswordBackDiv.delay(400).slideDown();
    $backBtnForgotPassword.delay(400).slideDown();
    $forgotPasswordDisplay.delay(400).slideDown();    
  });

  $sendMailButton.on('click', function (ev) { 
    var formData = {
      username: $forgotPasswordEmailInput.val().trim()
    };
    app.utils.ajax.post('/auth/reset-password', {
      data: formData
    }).then(
      function (data) {
        app.utils.unloadOpenModals();
        app.utils.notify('Password reset request sent. You\'ll receive an email shortly', 'success', 4).delay(200);

      },
      function (res) {
        authMessage('Something went wrong. Please try again later', 'error', 2);
      }
    );
    // }
  });

  $signupTrg.on('click', function (ev) {
    $backBtn.fadeIn();
    $socialBtn.slideUp();
    $showIfForm.css({
      display: 'block'
    });
    $hideIfForm.css({
      display: 'none'
    });
    $signupDisplay.delay(400).slideDown();
  });

  $loginTrg.on('click', function (ev) {

    $backBtn.fadeIn();
    $socialBtn.slideUp();
    $showIfForm.css({
      display: 'block'
    });
    $hideIfForm.css({
      display: 'none'
    });
    $loginDisplay.delay(400).slideDown();
  });

  $backBtnForgotPassword.on('click', function (ev) {
    $forgotPasswordDisplay.slideUp();
    $forgotPasswordBackDiv.slideUp();
    $normalBackDiv.delay(400).slideDown();
    $loginDisplay.delay(400).slideDown();
  });


  $backBtn.on('click', function (ev) {
    $backBtn.fadeOut();
    $forgotPasswordDisplay.slideUp();
    $loginDisplay.slideUp();
    $signupDisplay.slideUp();
    $socialBtn.delay(400).slideDown();
    $hideIfForm.delay(400).slideDown();
    $showIfForm.css({
      display: 'none'
    });
  });

  var w = 700;
  var h = 480;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  
  $fb.on('click', function (ev) {
    //window.openUniquePopUp('/auth/facebook', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    //url = '/auth/facebook';       
    openWin('facebook'); 
  });
  $twt.on('click', function (ev) {
    //window.openUniquePopUp('/auth/twitter', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    //url = '/auth/twitter';
    openWin('twitter');
  });
  $ggl.on('click', function (ev) {
    //window.openUniquePopUp('/auth/google', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
    openWin('google');
  });


  function openWin(name){
    var loginPopup=window.open('/auth/' + name, name + 'LoginPopup', 'width=' + 700 + ',height=' + 480 + ',top=' + top + ',left=' + left);
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