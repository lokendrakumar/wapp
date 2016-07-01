app.components.dubCategoryAudio = function ($allTracks) {

  var $track = $allTracks.find('.track');
  var $playBtn = $track.find('.playBtn');
  var isPlaying = false;
  var $allAudio = $allTracks.find('.audio');
  var $deleteBtn = $allTracks.find('.deleteBtn');

  $playBtn.on('click', function (ev){
    var $song = $(this).parent();
    var $audio = $song.find('.audio');
    if ($(this).html() == 'pause'){
      $audio.trigger('pause');
      $(this).html('play_arrow');
    } else {
      $allAudio.trigger('pause');
      $audio.trigger('play');
      $playBtn.html('play_arrow');
      $(this).html('pause');
    }
  });

    $deleteBtn.on('click', function (ev){
    var id = $(this).data('song-id');
    var cat_id = $(this).data('cat-id');
    var formData = {
      'song_id': id,
      'cat_id': cat_id
    }
       
    var $parent = $(this).parent();
    var getData = { data: formData};
    app.utils.ajax.post('/dubsmash/tracks/delete', {data: formData}).then( function (data) {
      $parent.hide('slow'); 
      app.utils.reloadBottomOnly();
    });
  }); 
 
}