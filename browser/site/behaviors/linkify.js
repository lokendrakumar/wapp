app.behaviors.linkify = function ($input) {     
      var originalText = $input.html();
      var linkifiedText = Autolinker.link( originalText );
      $input.html(linkifiedText);
};