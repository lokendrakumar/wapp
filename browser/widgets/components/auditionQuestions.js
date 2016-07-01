app.components.auditionQuestions = function ($panel) {

  var username = $panel.data('username');
  var $recorder = $panel.find('.popupRecorder');
  //var userId ;
  var targetUrl;
  //var profileId;
  var questionOnly = false;

  var left = (screen.width / 2) - (300 / 2);
  var top = (screen.height / 2) - (500 / 2);

  $recorder.on('click', function (ev) {
    openWin();
  });

  function openWin(){
    var recorderPopup=window.open($recorder.data('url'),'auditionRec', 'width=' + 310 + ',height=' + 550 + ',top=' + top + ',left=' + left);
    // Add this event listener; the function will be called when the window closes
    recorderPopup.onbeforeunload = function(){

      
      targetUrl = '/widgets/popup/question/' + username + '?partials[]=auditionQuestions';
      console.log(targetUrl);
      
      app.utils.ajax.get(targetUrl, {
      data: {
        author: app.AUDITIONPOPUP.createdBy,
        offset: 0,
        limit: 10
        }
      }).then(
      function (data) {
        app.AUDITIONPOPUP.panel.html(data.auditionQuestions);
      });
    }; 
    recorderPopup.focus();
  }

}


