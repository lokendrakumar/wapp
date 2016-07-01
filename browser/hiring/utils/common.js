app.utils.btnStateChange = function (button, message, disabled) {
  var $button = button;
  // var imgHtml =  '<img src="/img/preloader.gif" class="left"/>'+
  //                 '<div class="inBtnState">'+
  //                 '</div>';
  
  
  if (disabled) {
    // $button.addClass('fullbtn');
    // $button.html(imgHtml);
    // var $inBtnState = $button.find('.inBtnState');
    $button.html(message);
    
    $button.addClass('disabled');
  } else {
    // $button.removeClass('fullbtn');
    $button.removeClass('disabled');    
    $button.html(message);
  }
  app.utils.domain = function () {
    return [location.protocol, '//', location.host].join('');
  };

  app.utils.redirectTo = function (path) {
   window.location.href = app.utils.domain()+path;
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

};
