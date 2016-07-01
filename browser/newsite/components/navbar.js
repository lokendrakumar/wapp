app.components.navBar = function($navBar) {
  var link = window.location.pathname;
  if (link.indexOf('/discover') > -1) {
    $navBar.find('[data-link-discover]').addClass('active');
  } else if (link.indexOf('/feed') > -1) {
    $navBar.find('[data-link-home]').addClass('active');
  }


  var $logOutBtn = $('.logout');

  $logOutBtn.on('click', function (ev) {
     ev.preventDefault();
     app.utils.ajax.post("/logout").then(function (){
       if (app.utils.currentUrl() === app.utils.domain() + '/feed') {
        app.utils.redirectTo('/discover');
       }
       else {
        app.utils.reloadNavAndPanel();
     }
     Materialize.toast('Logged Out', 5000);
    });
  });
}
