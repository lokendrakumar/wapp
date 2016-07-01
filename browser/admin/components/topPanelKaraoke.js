app.components.topPanelKaraoke = function ($search) {
  var $playBtn = $search.find('.playBtn');
  var $closeBtn = $search.find('.closeBtn');
  var $addTrack = $search.find('.addTrack');
  var $addCategory = $search.find('.addCategory');
  var $image;
  var $instrument;
  var $mp3;
  var $trackName;
  var $trackTwitter;
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


  $(function() {
    var cache = {};
    $search.find( ".search-karaoke" ).autocomplete({
      minLength: 2,
      delay:1500,
      source: function( request, response ) {
        var term = request.term;
        response( cache );
        $(function (string) {
          console.log('here',term);
          var data = {
            string: term,
            feature: 'karaoke'
          };
          app.utils.ajax.get('/search/Audio',{data: data}).then(function (result) {
            cache = result.items;
          });
        });
      },
      focus: function( event, ui ) {
        $( ".search-karaoke" ).val( ui.item.name);
        return false;
      },
      select: function( event, ui ) {
        $search.find( ".search-karaoke" ).val( ui.item.name );
        $search.find( ".search-karaoke" ).attr('data-id', ui.item.id );
        $search.find( ".search-karaoke" ).attr('data-url', ui.item.url );
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

  var $categoryImage = $search.find('.categoryImage');
  $categoryImage.on('change', function (ev){
    $image = $(ev.currentTarget)[0].files[0];
  })
  
  $addCategory.on('click', function (ev) {
    var $categoryName = $search.find('.categoryName');   
    var $categoryTwitter = $search.find('.categoryTwitter');
    var categoryTop = $search.find('.categoryTop').is(':checked') ? 1:0;
    
    if($categoryName.val()){

      var formdata = new FormData();
      formdata.append("icon_image", $image);
      formdata.append("display_name", $categoryName.val());
      formdata.append("twitter_handle", $categoryTwitter.val());
      formdata.append("show_on_top", categoryTop);

      app.utils.ajax.post('/karaoke/addCategory', {
          data:formdata,
          processData: false,
          contentType: false
      }).then(function (data) {
        //console.log(data)
        window.location.reload();
      });
    }else{
      Materialize.toast('Please Input Category Name', 4000);
    }
  });


  var $trackInstrument = $search.find('.instrumentMP3');
  $trackInstrument.on('change', function (ev){
    $instrument = $(ev.currentTarget)[0].files[0];
  });

  var $mp3 = $search.find('.voiceMP3');
  $mp3.on('change', function (ev){
    ev.stopPropagation();
    $mp3 = $(ev.currentTarget)[0].files[0];
  });
  
  $addTrack.on('click', function (ev) {

    $trackName = $search.find('.trackName');   
    $trackTwitter = $search.find('.trackTwitter');
    if(app.categoryId){
      if($trackName.val()){
        if($instrument){
          if($mp3){
            addNewTrack();
          }else{
            Materialize.toast('Please Type Voice MP3', 4000);
            return false;
          }
        }else{
          Materialize.toast('Please Type instrument MP3', 4000);
          return false;
        }
      }else{
          Materialize.toast('Please Type Track Name', 4000);
          return false;
      }
    }else{
        Materialize.toast('Please Select a Category', 4000);
        return false;
    }
  
 });

  var addNewTrack = function() {

    var formdata = new FormData();
      formdata.append("parent_category_id", app.categoryId)
      formdata.append("karaoke_file", $instrument);
      formdata.append("voice_file", $mp3);
      formdata.append("display_name", $trackName.val());
      formdata.append("twitter_handle", $trackTwitter.val());
      app.utils.ajax.post('/karaoke/addTrack', {
          data:formdata,
          processData: false,
          contentType: false
      }).then(function (data) {
        window.location.reload();
      });
  } 

}