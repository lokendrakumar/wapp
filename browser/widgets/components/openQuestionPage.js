app.components.openQuestionPage = function ($page) {
  var $introVideo = $page.find('.introVideo');
  var $videoHolder = $introVideo.parent();
  var $introVideoImage = $introVideo.parent().find('img.userImg');
  var $addImage = $page.find('.addImage');
  var $editBtn = $page.find('.editBtn');
  var $upload = $page.find('.upload');
  var $newImage = $page.find('.static-page');
  var questionId = $page.data('question-id'); 

  imagesLoaded($introVideoImage[0], function (instance) {
    var width = $videoHolder.width();
    $videoHolder.css("height", width);
  });
  $introVideoImage.on('click', function () {
    $introVideoImage.fadeOut('slow');
    $introVideo.fadeIn('slow');
    app.behaviors.video($introVideo);
    $introVideo.trigger('click');
  });

  var $recorder = $page.find('.popupRecorder');
  var left = (screen.width / 2) - (300 / 2);
  var top = (screen.height / 2) - (500 / 2);
  $recorder.on('click', function (ev){
    ev.preventDefault();
    window.open($(this).data('url'), '', 'width=' + 300 + ',height=' + 500 + ',top=' + top + ',left=' + left);
  });

  var $followBtn = $page.find('.followBtn');
  app.behaviors.followBtn($followBtn);
  var $pageBanner = $page.find('.pageBanner');
  var $openQuestionHeaderFixed = $page.find('.openQuestionHeaderFixed');
  //console.log($openQuestionHeaderFixed.hide(),'here1');
  $openQuestionHeaderFixed.hide();
  //console.log("here");
/*  $(window).scroll(function() {
      if($(window).scrollTop() > 200){
        
        $openQuestionHeaderFixed.show();
       }
       else{
        $pageBanner.show();
        $openQuestionHeaderFixed.hide();
       }

  });*/
  $editBtn.on('click',function(ev){
    $upload.css('display','block');
    $editBtn.css('display','none');
  });

  $upload.on('click',function(){
    $editBtn.css('display','block');
    $upload.css('display','none');
 

  });
  $addImage.on('change', function () {

  var image = $addImage[0].files[0];


  var formdata = new FormData();
  formdata.append('image', image);
  formdata.append('questionId', questionId);
     app.utils.ajax.post('/widgets/imageUplaod', {
        data: formdata,
        processData: false,
        contentType: false  
      }).then(
        function (data) {
          window.location.reload();  

        },
        function (err) {
        });

    });
}