app.behaviors.global = function () {
  /**
   * top level post button 
   */
  app.$window.on('scroll', function (ev) {
    var $postBtnTop = $('#postBtnTop');
    if ($postBtnTop.length > 0) {
      if (app.$window.scrollTop() > 200) {
        $postBtnTop.fadeIn();
      } else {
        $postBtnTop.fadeOut();
      }
    }
  });

  app.utils.internet();
};

$(function(){
  app.behaviors.global();
});