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
