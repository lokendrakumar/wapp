app.components.profileFeedRight = function($card){
  var $taball = $card.find('.tab-all');
  var $tabquestion = $card.find('.tab-question');
  var $tabpost =  $card.find('.tab-post');

  var $divall = $card.find('#tab-all');

  var taballflag = true;
  var tabquestionflag = false;
  var tabpostflag = false;
  app.FRANKLY = (app.FRANKLY === undefined) ? {currentfeed: ""} : app.FRANKLY;
  app.FRANKLY.dataelem = (app.FRANKLY.dataelem === undefined) ? {} : app.FRANKLY.dataelem;
  app.FRANKLY.dataelem['All'] = $divall.html();
  var QuestionPostPartial = function (param, requestparam){
    if (!app.FRANKLY.dataelem[requestparam]){
      app.utils.ajax.get('/'+param,{data:{
          username: param,
          partials: ['profileall'],
          feedParam: requestparam
        }}).then(
        function(data){
          $divall.empty();
          $divall.append(data.profileall);
          app.FRANKLY.dataelem[requestparam] = data.profileall;
          $divall.css('display','block');
        });
    }
    else{
        $divall.empty();
        $divall.append(app.FRANKLY.dataelem[requestparam]);
    }
  }

  $taball.on('click', function(){
    app.FRANKLY.currentfeed = 'All';
    $tabquestion.removeClass('current');
    $tabpost.removeClass('current');
    $taball.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'All';
    QuestionPostPartial(data, feedParam);
  });

  $tabquestion.on('click', function(){
    app.FRANKLY.currentfeed = 'Question';
    $tabpost.removeClass('current');
    $taball.removeClass('current');
    $tabquestion.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'Question';
    QuestionPostPartial(data, feedParam);
  });

  $tabpost.on('click', function(){
    app.FRANKLY.currentfeed = 'Post';
    $taball.removeClass('current');
    $tabquestion.removeClass('current');
    $tabpost.addClass('current');
    var username = app.utils.currentUrl().split('/');
    var data = username[username.length-1];
    var feedParam = 'Post';
    QuestionPostPartial(data, feedParam);
  });
}
