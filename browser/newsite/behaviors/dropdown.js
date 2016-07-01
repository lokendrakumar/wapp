app.behaviors.dropdown = function ($card) {
  $card.find('i.icon-options').on('click', function (e) {
    e.preventDefault();
    var flag = $(this).closest('i').find('ul.dropdown-content-new').css('display');
    $('i ul').hide('slow');
    if(flag == 'none'){
      $(this).closest('i').find('ul.dropdown-content-new').show('slow');
    } else {
      $(this).closest('i').find('ul.dropdown-content-new').hide('slow');
    }
  });
}
