app.components.searchClick = function($click){
  var $searchBar = $click.find('#search');
  var $searchDiv = $click.find('.search');
  var searchUrl = $searchDiv.data('search-url')
  $searchBar.keyup(function (event){
    //console.log('here');
    if(event.keyCode == 13){
      window.location = searchUrl + "?searchcontent="+$searchBar.val();
    }
  });

}