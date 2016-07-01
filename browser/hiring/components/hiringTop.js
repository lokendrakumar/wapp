app.components.TopController = function($top) {

  var $logOutBtn =$top.find('.logout') 
  $logOutBtn.on('click', function (ev) {
    ev.preventDefault();
    app.utils.ajax.post("/logout").then(function (){

      window.location.replace(window.location.protocol + '//'+ window.location.hostname +'/auth/login?from=/dashboard');
      app.utils.notify('Logged Out', 'success', 10);
    });
  });
}