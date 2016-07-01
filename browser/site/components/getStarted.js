app.components.getStarted = function($nav) {
  var $signInModal = $nav.find('.signin-link');
  
  $signInModal.on('click', function (ev) {
    
    app.utils.loadModal('#authModal', '/modal/auth');
  });
  
};
