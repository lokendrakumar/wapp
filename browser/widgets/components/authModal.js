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