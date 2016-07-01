app.components.loginPage = function ($modal) {
  var authMessage = function (text, type, duration) {

    $('#authModalMessage').fadeIn().addClass(type).html(text + '<a href="#" class="auth close">&times;</a>');

    //Types are: alert, success, warning, info
    if (duration != 0) {
      setTimeout(function () {
        $('#authModalMessage').removeClass(type).fadeOut().html('loading <a href="#" class="auth close">&times;</a>');
      }, duration * 1000);
    }
  }
 var $hiringRedirectionField = $modal.find('.hiringRedirectionField');
  var authSuccess = function (user) {
    app.utils.unloadModal($modal.parent());
    app.utils.notify('Success !!', 'success', 10);
    mixpanel.track(
      "Login Successful",
      {"Source": app.$body.data('source')}
    );
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
    
    //app.utils.reloadNavAndPanel();
    if(app.$body.data('from')){
       //app.utils.redirect(app.$body.data('from')+'?username='+app.$body.data('username'));
       app.utils.redirectTo('/discover?redirect='+app.$body.data('from'));
       return;
    }
    
    if($hiringRedirectionField.data('value') !== null){
       app.utils.redirectTo($hiringRedirectionField.data('value'));
       return;
    }

     if ((app.utils.currentUrl() === app.utils.domain() + '/') || (app.utils.currentUrl() === app.utils.domain() + '/auth/login')) {
         app.utils.redirectTo('/discover');
         
    } else {
      app.utils.reloadNavAndPanel();
    }
  };

  (function initializeOpenUniquePopUp() {
    //set this to domain name
    var openedDomain = 'http://frankly.me'; //app.utils.domain();
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
      if (event.origin == openedDomain) {
        var winst = event.source;
        winst.close();
        authSuccess();
        trackedWindows[event.data] = true;
      }
    };
  })();

  var $loginTrg = $modal.find('#loginTrg');
  var $signupTrg = $modal.find('.signUpTrg');
  var $loginForm = $modal.find('#loginForm');
  var $signupForm = $modal.find('#signupForm');
  var $loginDisplay = $modal.find('#loginDisplay');
  var $signupDisplay = $modal.find('#signupDisplay');
  var $hideIfForm = $modal.find('.hide-if-form');
  var $showIfForm = $modal.find('.show-if-form');
  var $socialBtn = $modal.find('#socialBtn');
  var $loginBtn = $loginForm.find('.login-btn');
  var $registerBtn = $signupForm.find('.register-btn');
  var $fb = $socialBtn.find('.fb');
  var $twt = $socialBtn.find('.twt');
  var $ggl = $socialBtn.find('.ggl');
  var $backBtn = $modal.find('.frankly-back');
  var $forgotPasswordBtn = $modal.find('.forgot-password');

  $loginBtn.on('click', function (ev) {
    // ev.preventDefault();
    app.utils.btnStateChange($loginBtn, "Signing In", true);

    var formData = {
      username: $loginForm.find('#email').val(),
      password: $loginForm.find('#password').val()
    };

    if (!$loginForm[0].checkValidity()) {
      return;
    }

    app.utils.ajax.post('/auth/local', {
      data: formData
    }).then(
      function (data) {
        authSuccess();
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
    if (!$signupForm[0].checkValidity()) {
      return;
    }
    app.utils.ajax.post('/auth/register', {
      data: formData
    }).then(
      function (data) {
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
    var formData = {
      username: $loginForm.find('input[name="email"]').val()
    };

    app.utils.ajax.post('/auth/reset-password', {
      data: formData
    }).then(
      function (data) {
        alert('Password reset request sent. You\'ll receive an email shortly');
      },
      function (res) {
        alert('Something went wrong. Please try later');
      }
    );
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

  $backBtn.on('click', function (ev) {
    $backBtn.fadeOut();
    $loginDisplay.slideUp();
    $signupDisplay.slideUp();
    if($hiringRedirectionField.data('value') === null){
      $socialBtn.delay(400).slideDown();
    }

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
    window.openUniquePopUp('/auth/facebook', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $twt.on('click', function (ev) {
    window.openUniquePopUp('/auth/twitter', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
  $ggl.on('click', function (ev) {
    window.openUniquePopUp('/auth/google', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);
  });
};