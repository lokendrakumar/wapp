app.behaviors.shareBtn = function(shareSelector, $shareIcon){

  var share = new Share(shareSelector, {
    url: $shareIcon.data('url'),
    networks: {
      email: {
        enabled: true,
        title: $shareIcon.data('title'),
        description: $shareIcon.data('slug')
      }
    }
  });
  
  $shareIcon.hover(
    function(){
      share.open();
    },
    function(){
      share.close();
    }
  );
};