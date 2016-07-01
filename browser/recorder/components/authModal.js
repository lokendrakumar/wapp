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
