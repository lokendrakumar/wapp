app.components.topPanelDubsmash = function ($search) {
  var $playBtn = $search.find('.playBtn');
  var $closeBtn = $search.find('.closeBtn');
  var $addTrack = $search.find('.addTrack');
  $closeBtn.on('click', function () {
    $(this).parent().find('.audio-search').trigger('pause');
    $(this).closest('.searchResult').hide('slow');
  });

  $playBtn.on('click', function (ev) {
    $audio = $(this).parent().find('.audio-search');
    if ($(this).html() == 'pause') {
      $audio.trigger('pause');
      $(this).html('play_arrow');
    } else {
      $audio.trigger('play');
      $(this).html('pause');
    }
  });

  $search.find('.audio-search').on('ended', function() {
    $playBtn.html('play_arrow');
  });

  $addTrack.on('click', function () {
    app.utils.ajax.get('/')
  });

  $(function() {
    var cache = {};
    $search.find( ".search-dubsmash" ).autocomplete({
      minLength: 2,
      source: function( request, response ) {
        var term = request.term;
        response( cache );
        $(function (string) {
          var data = {
            string: term,
            feature: 'dubsmash'
          };
          app.utils.ajax.get('/search/Audio',{data: data}).then(function (result) {
            cache = result.items;
          });
        });
      },
      focus: function( event, ui ) {
        $( ".search-dubsmash" ).val( ui.item.name);
        return false;
      },
      select: function( event, ui ) {
        $search.find( ".search-dubsmash" ).val( ui.item.name );
        $search.find( ".search-dubsmash" ).attr('data-id', ui.item.id );
        $search.find( ".search-dubsmash" ).attr('data-url', ui.item.url );
        $search.find(".searchResult").css("display", "block");
        $search.find(".ul-searchResult").attr("data-id", ui.item.id);
        $search.find(".audio-search").attr("src", ui.item.url);
        $search.find( ".trackName" ).empty().append(ui.item.name);
        return false;
      }
    })
    .autocomplete( "instance" )._renderItem = function( ul, item ) {
      return $( "<li>" )
        .append( "<a class='grey-text text-darken-2' data-id=" + item.id + " data-url=" + item.url + ">" + item.name + "</a>" )
        .appendTo( ul );
    };
  });
};