app.components.share = function ($card) {

$shareIcon = $card.find('.shareIcon');

$shareIcon.on('click',function(){
  $(this).find('i.toggle').toggleClass("selectedShare");
});    

$mainShareButton = $card.find('.mainShareButton');

var w = 700;
var h = 480;
var left = (screen.width / 2) - (w / 2);
var top = (screen.height / 2) - (h / 2);

$mainShareButton.on('click',function(){
  $.each($card.find('i.selectedShare'), function (index, item) {
    console.log(index);
    console.log(item);

    if($(item).hasClass('facebook-icon')){
    window.open('/auth/facebook', 'twitter', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left);

      window.open('https://www.facebook.com/sharer/sharer.php?u=' + "google.com", 'facebook', 'width='+w+',height='+h+',top='+top+',left='+left);
      
    }
    
  });


});
//console.log($mainShareButton);

}