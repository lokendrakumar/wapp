app.behaviors.textArea = function ($textArea, $countDisplay, $actionBtn, displayCutoff) {
  var supportOnInput = 'oninput' in document.createElement('input');
  var maxLength = parseInt($textArea.data('maxlength'));
  $textArea.on(supportOnInput ? 'input' : 'keyup', function (ev) {
    var charCount = $textArea.val().length;
    if(charCount >= displayCutoff) {
      $countDisplay.find('.character-count').html(maxLength - charCount);
    } else {
      $countDisplay.find('.character-count').html(''); 
    }

    if (charCount > maxLength) {
      $countDisplay.addClass('rc').removeClass('scolor yc');
      $actionBtn.addClass('disabled');
      app.utils.notify('Limit('+maxLength+') Exceeded',"error",2);
      $actionBtn.css('pointer-events', 'none');
    } else if (charCount > Math.floor(maxLength/2)) {
      $countDisplay.addClass('yc').removeClass('scolor rc');
      $actionBtn.removeClass('disabled');
      $actionBtn.css('pointer-events', 'auto');
    } else {
      $countDisplay.addClass('scolor').removeClass('rc yc');
      $actionBtn.removeClass('disabled');
      $actionBtn.css('pointer-events', 'auto');
    }
  });

  $textArea.on('blur', function () {
    $countDisplay.fadeOut();
  });

  $textArea.on('focus', function () {
    $countDisplay.fadeIn();
  });
};