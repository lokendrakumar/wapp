app.components.navController = function($nav) {
  var $navBar = $nav.find('.top-bar');
  var $stickyLinks = $navBar.find('.sticky-links');
  var $discoverLink = $stickyLinks.find('.discover-link');
  var $signInModal = $stickyLinks.find('.signin-link');
  var $logOutBtn = $nav.find('.logout');

  var $askQuestionBtn = $nav.find('#postBtnTop');

  $signInModal.on('click', function (ev) {
    app.utils.loadModal('#authModal', '/modal/auth');
  });

  $logOutBtn.on('click', function (ev) {
    ev.preventDefault();
    app.utils.ajax.post("/logout").then(function (){
      if (app.utils.currentUrl() === app.utils.domain() + '/feed') {
      app.utils.redirectTo('/discover');
      } else {
        app.utils.reloadNavAndPanel();
      }
      
      app.utils.notify('Logged Out', 'success', 10);

      app.$document.find('#fb-tracker').remove();
    });
  });

  if ($askQuestionBtn.length > 0) {
    $askQuestionBtn.children('a').on('click', function (ev) {
      ev.preventDefault();
      
      var $a = $(this);
      app.utils.loadModal('#'+$a.data('modal-id'), $a.data('modal-url'));
    });
  }
};