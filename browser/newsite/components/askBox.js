app.components.askBox = function($askBox, modal) {

  var $postArea = $askBox.find('.postArea');
  var $postBtn = $askBox.find('.postBtn');
  var $countDisplay = $askBox.find('.countDisplay');
  var $anonymousDiv = $askBox.find('.anonymousDiv');
  var $anon = $askBox.find('#anon');
  var $anonymousSpan = $askBox.find('.anonymousSpan');
  var $label = $askBox.find('.anonLabel');
  var anonymous = false;
  var minLength = $postArea.data('minlength');
  var $alertHookBar = $askBox.find('.alert-hookBar');
  var $alertBoxBar = $askBox.find('.alert-boxBar');
  var $alertBox = $askBox.find('.alert-box');

  var notifyAskBox = function(text, type, duration) {
    $alertHookBar.fadeIn();
    $alertBoxBar.fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');

    // Types are: alert, success, warning, info
    if (duration != 0) {
      setTimeout(function() {
        $alertBox.removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
      }, duration * 1000);
    }
    $(document).on('close.alert', function(event) {
      $alertHookBar.html('<div data-alert  class=" alert-box alert radius alert-boxBar" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
    });
  };
  // if (modal === false) {
  //   $postArea.on('click', function (ev) {
  //     ev.stopPropagation();
  //     $postArea.animate({height: '120px'}, 100).addClass('active');
  //     $anonymousDiv.delay('slow').fadeIn();
  //   });
  //   app.behaviors.textArea($postArea, $countDisplay, $postBtn, 225);

  //   app.$document.click(function() {
  //     if ($postArea.val().length === 0) {
  //       $anonymousDiv.fadeOut();
  //       $postArea.animate({height: '39px'}, 100).removeClass('active');

  //     }
  //   });
  // } else {
  $anonymousDiv.delay().fadeIn();
  var supportOnInput = 'oninput' in document.createElement('input');
  var maxLength = parseInt($postArea.data('maxlength'));
  var displayCutoff = 225;

  $postArea.on(supportOnInput ? 'input' : 'keyup', function(ev) {

    var charCount = $postArea.val().length;
    if (charCount >= displayCutoff) {
      $countDisplay.find('.character-count').html(maxLength - charCount);
    } else {
      $countDisplay.find('.character-count').html('');
    }

    if (charCount > maxLength) {
      $countDisplay.addClass('rc').removeClass('scolor yc');
      $postBtn.addClass('disabled');
      notifyAskBox('Limit(' + maxLength + ') Exceeded', "error", 2);
    } else if (charCount > Math.floor(maxLength / 2)) {
      $countDisplay.addClass('yc').removeClass('scolor rc');
      $postBtn.removeClass('disabled');
    } else {
      $countDisplay.addClass('scolor').removeClass('rc yc');
      $postBtn.removeClass('disabled');
    }
  });

  $postArea.on('blur', function() {
    $countDisplay.fadeOut();
  });

  $postArea.on('focus', function() {
    $countDisplay.fadeIn();
  });
  delete(app.cache.userQuestion);
  // }

  $anonymousDiv.on('click', function(ev) {
    ev.stopPropagation();
    return;
  });

  $anon.on('change', function(ev) {
    ev.stopPropagation();
    if (this.checked) {
      anonymous = true;
      $anonymousSpan.removeClass('scolor2');
    } else {
      anonymous = false;
      $anonymousSpan.addClass('scolor2');
    }
  });

  // store postArea question in a cache
  $postArea.on('keyup', function(ev) {
    app.cache.userQuestion = $postArea.val();
  });

  // set postArea val to cache value
  if (typeof(app.cache.userQuestion) === 'string' && app.cache.userQuestion.length > 0) {
    $postArea.val(app.cache.userQuestion);
  }

  // handle post submission
  var $shareAlert = $askBox.find('.share-alert');
  var targetUrl = $askBox.data('target');
  var shareAlertHtml = $shareAlert.html();

  $postArea.on('focus', function(ev) {
    $postArea.removeClass('rbr');
    $shareAlert.slideUp(1000);
  });

  var shareSelector = '#icon-share-' + $askBox.attr('id');
  var $shareIcon = $askBox.find(shareSelector);

  /**
   * Ask question button click
   */
  $postBtn.on('click', function(ev) {
    ev.stopPropagation();
    if ($postArea.val()) {
      app.utils.btnStateChange($postBtn, "Asking...", true);
      $shareAlert.html(shareAlertHtml);
      if ($postArea.val().length === 0 || $postBtn.hasClass('disabled') || $postArea.val().length <= 15) {
        $postArea.addClass('rbr');
        $postArea.trigger('click');
        if ($postArea.val().length <= 15) {
          Materialize.toast('Ask question in more than 15 characters', 3000);
        }
      } else {

      }

      var formData = {
        question: {
          body: $postArea.val(),
          is_anonymous: anonymous
        }
      };
      app.utils.ajax.post(targetUrl, {
        data: formData,
      }).then(
        function(data) {
          var editData = document.createElement('div');
          $(editData).addClass('col s12 m6');
          if (data.openQuestionCard) {
            $(editData).html(data.openQuestionCard);
          } else {
            $(editData).html(data.questionCard);
          }

          $('[data-feed-class]').prepend($(editData));
          Materialize.toast('Open question posted succesfully', 3000);
          // var question = data.question;
          // $shareAlert.slideDown(1000);
          // $shareAlert.find('i.last-question').html($postArea.val());
          // var urlShare = "http://frankly.me/"+question.to.username+"/"+question.slug;
          // $shareIcon.data('url',urlShare);
          // app.behaviors.shareBtn(shareSelector, $shareIcon);
          if (targetUrl.indexOf("openquestion") > 0) {
            app.utils.btnStateChange($postBtn, "Ask Open Question", false);
          } else {
            app.utils.btnStateChange($postBtn, "Ask Question", false);
          }
          // // $postBtn.html("Ask Question");
          // // $postBtn.removeClass("disabled");
          $postArea.val('');
          // $countDisplay.find('.character-count').html($postArea.data('maxlength'));
          delete(app.cache.userQuestion);
          //setTimeout(function () { app.utils.reloadNavAndPanel(); }, 2000);
        },
        function(xhr) {
          if (targetUrl.indexOf("openquestion") > 0) {
            app.utils.btnStateChange($postBtn, "Ask Open Question", false);
          } else {
            app.utils.btnStateChange($postBtn, "Ask Question", false);
          }
          console.log(xhr);
        }
      );
    } else {
      Materialize.toast('Enter Question', 2000);
    }

  });

  var domNodeRemovalListener = function(ev) {
    if (app.utils.$elRemoved(ev, $askBox)) {
      app.$document.off('DOMNodeRemoved', domNodeRemovalListener);
    }
  };

  app.$document.on('DOMNodeRemoved', domNodeRemovalListener);
};
