app.components.myProfileLeftPane = function ($pane) {

  var $profileBio = $pane.find('.bioDisplay');
  
  app.behaviors.linkify($profileBio);


  var $existingProfileVideo = $pane.find('.existingProfileVideo');
  var $overlay = $pane.find('div.dvImgOverlay');
  var $videoHolder = $pane.find('.dvHolder');
  var $iconProfileImage = $overlay.find('.icon-vid');
  var $imageProfile = $overlay.find('.userImg');
  var videoSrc = $existingProfileVideo.attr('src');

  imagesLoaded($imageProfile[0], function (instance) {
    var top = parseInt($overlay.width()) / 2;
    var width = $videoHolder.width();
    $iconProfileImage.attr("style", "top:" + (top - 20) + "px; left:" + (top-20) + "px;");
    $videoHolder.css("height", width);
  });

  $overlay.on('click', function () {
    if (videoSrc) {
      $overlay.fadeOut();
      $existingProfileVideo.fadeIn();
      $existingProfileVideo.trigger('click');
    } else {
      app.utils.notify('Sorry! The video you requested is not available.', 'error', 5);
    }
  });

  $existingProfileVideo.on('pause ended', function (ev) {
    $overlay.fadeIn();
    $existingProfileVideo.fadeOut();
  });
  app.behaviors.video($existingProfileVideo);

  /**
   * tackle the view changes on different button clicks
   */
  var $saveProfileDetailsButton = $pane.find('#profileSaveButton');
  var targetUrl = $saveProfileDetailsButton.data('target');
  var $profileNotEditingView = $pane.find('.pv.notEditing');
  var $profileEditingView = $pane.find('.pv.editing');
  var $recordVideoText = $pane.find('.recordVideoText');
  var $recordVideoInfoText = $pane.find('.video-attachment-info');

  var $nameDisplay = $pane.find('.nameDisplay');
  var $nameInput = $pane.find('.nameInput');

  var $bioDisplay = $pane.find('.bioDisplay');
  var $bioInput = $pane.find('.bioInput');

  var $editProfileBtn = $pane.find('.editProfileBtn');
  var $saveActions = $pane.find('.saveActions');
  var $cancelBtn = $pane.find('.cancelBtn');

  var $profileMediaEditBtn = $pane.find('.profileMediaEditBtn');
  var $profileMediaEditArea = $pane.find('.profileMediaEditArea');

  var animationTime = 200;
  var formData = new FormData();
  var videoAdded = false;

  /**
   * function to switch to editing mode
   */
  var switchToEditingView = function () {
    $profileMediaEditBtn.delay(animationTime).fadeIn(animationTime);
    $editProfileBtn.fadeOut(animationTime);
    $saveActions.delay(animationTime).fadeIn(animationTime);
    $profileNotEditingView.fadeOut(animationTime)
    $profileEditingView.delay(animationTime).fadeIn(animationTime);
    $nameDisplay.fadeOut(animationTime);
    $nameInput.delay(animationTime).fadeIn(animationTime);
    $bioDisplay.fadeOut(animationTime);
    $bioInput.delay(animationTime).fadeIn(animationTime);
  };

  /**
   * function to switch to normal view (non editing view)
   */
  var switchToNotEditingView = function () {
    $saveActions.fadeOut(animationTime);
    $editProfileBtn.delay(animationTime).fadeIn(animationTime);
    $profileEditingView.fadeOut(animationTime);
    $profileNotEditingView.delay(animationTime).fadeIn(animationTime);
    $nameInput.fadeOut(animationTime);
    $nameDisplay.delay(animationTime).fadeIn(animationTime);
    $bioInput.fadeOut(animationTime);
    $bioDisplay.delay(animationTime).fadeIn(animationTime);
    $profileMediaEditArea.fadeOut(animationTime);
  };

  /**
   * profile media edit button
   */
  $profileMediaEditBtn.on('click', function (ev) {
    ev.preventDefault();
    if ($profileMediaEditBtn.find('.profileMediaEditBtnText').html().trim() == "Not Now") {
      $profileMediaEditArea.fadeOut(animationTime);
      $profileMediaEditBtn.find('.profileMediaEditBtnText').html('Edit Profile Video');
    } else {
      $profileMediaEditArea.fadeIn(animationTime);
      $profileMediaEditBtn.find('.profileMediaEditBtnText').delay(animationTime).html('Not Now');
    }
  });

  /**
   * edit profile button
   */
  $editProfileBtn.on('click', function (ev) {
    ev.preventDefault();
    switchToEditingView();
  });

  /**
   * cancel button click
   */
  $cancelBtn.on('click', function (ev) {
    ev.preventDefault();
    switchToNotEditingView();
  });

  /**
   * tackle the behavior of the bioInput and charCount
   */
  var $bioTextarea = $bioInput.find('textarea');
  var $bioCount = $bioInput.find('.bioCount');
  
  app.behaviors.textArea($bioTextarea, $bioCount, $saveActions.find('.saveBtn'), 12);


  /**
   * Now we come to profileMedia. We create an object in which we will
   * store the image and video+audio files to be uploaded
   */
  var profileMediaFiles = {
    photo: null,
    video: null,
    audio: null,
    mediaSize: null
  };

  /**
   * tackle behavior for attaching image
   */
  var $attachedProfilePhotoInput = $profileMediaEditArea.find('input[name="profilePhoto"]');
  var $attachedProfilePhotoModal = $('#' + $pane.data('attached-photo-modal-id'));

  $attachedProfilePhotoInput.on('change', function (ev) {
    var photo = $attachedProfilePhotoInput[0].files[0];
    if (photo === undefined) return;

    profileMediaFiles.photo = photo;
    // now that we are sure we have a file, we need to open a goddamn modal
    // for repositioning this thing
    
    var photoUrl = window.URL.createObjectURL(photo);
    $attachedProfilePhotoModal.find('img').attr('src', photoUrl);
    app.utils.loadModal($attachedProfilePhotoModal);
  });

  /**
   * tackle the behavior for capturing photo
   */
  var $profilePhotoSnapshotBtn = $profileMediaEditArea.find('.photoCapture');
  var $profilePhotoSnapshotModal = $('#' + $pane.data('photo-snapshot-modal-id'));

  $profilePhotoSnapshotBtn.on('click', function (ev) {
    navigator.getUserMedia({video: true, audio: true}, function (stream) {
      var $video = $profilePhotoSnapshotModal.find('video');
      $video[0].volume = 0;
      $video.attr('src', window.URL.createObjectURL(stream));

      /**
       * load modal with video playing
       */
      app.utils.loadModal($profilePhotoSnapshotModal, null, function () {
        /**
         * capture btn handler
         */
        var $captureBtn = $profilePhotoSnapshotModal.find('.captureBtn');
        var captureHandler = function (ev) {
          ev.preventDefault();
          
          var photoUrl = app.utils.get$videoSnapshotUrl($video);
          // we get the file to upload here
          profileMediaFiles.photo = app.utils.dataURLToFile(photoUrl, 'captured');

          $attachedProfilePhotoModal.find('img').attr('src', photoUrl);
          app.utils.unloadOpenModals(function () {
            app.utils.loadModal($attachedProfilePhotoModal);
          });

          $captureBtn.off('click', captureHandler);
        };
        $captureBtn.on('click', captureHandler);

        /**
         * modal close handler
         */
        var modalCloseHandler = function (ev, closedModal) {
          if (closedModal === $profilePhotoSnapshotModal[0]) {
            stream.stop();
            app.vent.off('modal.closed', modalCloseHandler);
            $captureBtn.off('click', captureHandler);
          }
        };

        app.vent.on('modal.closed', modalCloseHandler);
      });

    }, function (err) {
      alert('webcam functionality not supported');
    });
  });

  /**
   * tackle the behavior for attaching video
   */
  var $attachedProfileVideoInput = $profileMediaEditArea.find('input[name="profileVideo"]');
  var $attachedProfileVideoModal = $('#' + $pane.data('attached-video-modal-id'));

  $attachedProfileVideoInput.on('change', function (ev) {
    var video = $attachedProfileVideoInput[0].files[0];
    var attachedFileSize = $attachedProfileVideoInput[0].files[0].size;
    
    if (attachedFileSize > (50 * 1024 * 1024)) {
      app.utils.notify('File Size extending 50 MB limit', 'error', 2);
    } else {
      if (video === undefined) return;

      profileMediaFiles.video = video;
      // now that we are sure we have a file, we need to open a goddamn modal
      // for user preview
      var reader = new FileReader();
      reader.readAsDataURL(video);
      reader.onload = function (ev) {
        var videoUrl = ev.target.result;
        $attachedProfileVideoModal.find('video').attr('src', videoUrl);
        $attachedProfileVideoModal.find('video')[0].play();
        app.utils.loadModal($attachedProfileVideoModal, null, function () {
          app.behaviors.video($attachedProfileVideoModal.find('video'), false);
          $attachedProfileVideoModal.find('video').trigger('croptofit');
        });
      };
    }
    ;
  });
  
  /**
   * tackle the behavior for capturing video
   */
  var $profileVideoCaptureBtn = $profileMediaEditArea.find('.videoCapture');
  var $profileVideoCaptureModal = $('#' + $pane.data('video-capture-modal-id'));

  var $uploadProfileVideoBtn = $attachedProfileVideoModal.find('.uploadProfileVideoButton');
  var $cancelProfileVideoBtn = $attachedProfileVideoModal.find('.rejectPofileVideoButton');
  $profileVideoCaptureBtn.on('click', function (ev) {
    navigator.getUserMedia({video: true, audio: true}, function (stream) {
      var $video = $profileVideoCaptureModal.find('video');
      $video[0].volume = 0;
      $video.attr('src', window.URL.createObjectURL(stream));

      /**
       * load modal with video playing
       */
      app.utils.loadModal($profileVideoCaptureModal, null, function () {
        app.behaviors.video($profileVideoCaptureModal.find('video'), false);
        /**
         * record btn handler
         */
        var modalHasBeenClosed = false;
        var recorderStopped = false;
        var recorder = null;
        var $recordBtn = $profileVideoCaptureModal.find('.recordBtn');
        var $timePlayedDisplay = $profileVideoCaptureModal.find('span.time-played');
        var timePlayedInterval = null;
        
        var recordHandler = function (ev) {
          ev.preventDefault();
          
          if ($recordBtn.find('i').hasClass('icon-record')) {
            // change this line for firefox compatibility
            recorder = new MultiStreamRecorder(stream);
            ////////////////////////////////////////
            /// max video time : 1 minute 30 seconds, average length of a smoke
            recorder.start(90 * 1000);
            ////////////////////////////////////////
            var secondsPassed = 0;

            timePlayedInterval = setInterval(function () {
              secondsPassed += 1;
              var minutes = Math.floor(secondsPassed / 60);
              var seconds = Math.floor(secondsPassed % 60);
              seconds = seconds.toString().length === 1 ? '0' + seconds : seconds;

              if (secondsPassed === 90) {
                // trigger the pausing click
                $recordBtn.trigger('click');
              }

              $timePlayedDisplay.html(minutes + ':' + seconds);
            }, 1000);

            $recordBtn.find('i').removeClass('icon-record').addClass('icon-stop')
            $recordBtn.find('.recordVideo').html('Stop');
          } else {

            clearInterval(timePlayedInterval);
            $timePlayedDisplay.html('0:00');
            $recordBtn.find('i').removeClass('icon-stop').addClass('icon-record')
            $recordBtn.find('.recordVideo').html('Record');

            recorder.ondataavailable = function (data) {
              if (!modalHasBeenClosed) {
                // This is where we get recorded video and audio data
                // These lines might also change for firefox
                profileMediaFiles.mediaSize = data.audio.size + data.video.size;
                profileMediaFiles.audio = app.utils.blobToFile(data.audio, 'recordedAudio');
                profileMediaFiles.video = app.utils.blobToFile(data.video, 'recordedVideo');
                ////////////////////////////////////////////
                // once we have this data, we do the necessary shit
                
                var audioSrc = window.URL.createObjectURL(profileMediaFiles.audio);
                var videoSrc = window.URL.createObjectURL(profileMediaFiles.video);

                $attachedProfileVideoModal.find('audio').attr('src', audioSrc);
                $attachedProfileVideoModal.find('video').attr('src', videoSrc);
                $attachedProfileVideoModal.find('audio')[0].play();
                $attachedProfileVideoModal.find('video')[0].play();

                recorderStopped = true;

                app.utils.unloadOpenModals(function () {
                  app.utils.loadModal($attachedProfileVideoModal, null, function () {
                    $attachedProfileVideoModal.find('video').trigger('croptofit');

                    /**
                     * attach modal close handler
                     */
                    var modalCloseHandler = function (ev, closedModal) {
                      if ($attachedProfileVideoModal[0] === closedModal) {
                        $attachedProfileVideoModal.find('video')[0].pause();
                        $attachedProfileVideoModal.find('audio')[0].pause();
                        app.vent.off('modal.closed', modalCloseHandler);
                      }
                    };

                    app.vent.on('modal.closed', modalCloseHandler);
                  });
                });
              }

              $recordBtn.off('click', recordHandler);
            };

            recorder.stop();
            stream.stop();
          }
        };

        $recordBtn.on('click', recordHandler);

        /**
         * modal close handler
         */
        var modalCloseHandler = function (ev, closedModal) {
          if (closedModal === $profileVideoCaptureModal[0]) {
            modalHasBeenClosed = true;
            if (!recorderStopped) {
              recorder && recorder.stop();
              stream && stream.stop();
              clearInterval(timePlayedInterval);
            }
            app.vent.off('modal.closed', modalCloseHandler);
            $recordBtn.off('click', recordHandler);
          }
        };

        app.vent.on('modal.closed', modalCloseHandler);
      });

    }, function (err) {
      alert('Turn on your webcam to allow recording');
    });
  });

  /**
   * add recorded video
   */
  $uploadProfileVideoBtn.on('click', function () {
    if (profileMediaFiles.mediaSize > (50 * 1024 * 1024)) {
      app.utils.notify('File Size extending 50 MB limit', 'error', 2);
      return;
    }

    app.utils.btnStateChange(
      $uploadProfileVideoBtn,
      'Working',
      true
    );
    formData.append('audio', profileMediaFiles.audio);
    formData.append('video', profileMediaFiles.video);
    videoAdded = true;
    app.utils.unloadModal($attachedProfileVideoModal);
    $recordVideoText.html('Record Again');
    $recordVideoInfoText.html('Video Recorded and Ready to upload');
  });

  /**
   * to update all the details of 'me'
   */
  $saveProfileDetailsButton.on('click', function () {
    if ($nameInput.val().length > 42 || $nameInput.val().length === 0 || $bioTextarea.val().length === 0 || $bioTextarea.val().length > 56 ) {
      app.utils.btnStateChange($saveProfileDetailsButton, 'Save', false);
      app.utils.notify("Enter valid values", "error", 2);
      switchToEditingView();
    } else {
      app.utils.btnStateChange($saveProfileDetailsButton, 'Saving', false);
      formData.append('bio', $bioTextarea.val());
      formData.append('first_name', $nameInput.val());
      var $progress = $pane.find('.dvProcessing');
      var $meter = $pane.find('.meter');
      if(videoAdded) {
        $progress.attr("style", "display:block;");
      }

      var setIntervalX = function (callback, delay, repetitions) {
        var x = 0;
        var intervalID = setInterval(function () {
          callback();
          if (++x === repetitions) {
            window.clearInterval(intervalID);
          }
        }, delay);
      }

      app.utils.ajax.post(targetUrl, {
        data: formData,
        processData: false,
        contentType: false,
        xhr: function() {  // Custom XMLHttpRequest
          var myXhr = new window.XMLHttpRequest();
          if(myXhr.upload){ // Check if upload property exists
            myXhr.upload.addEventListener('progress', function (e) {
              if(e.lengthComputable){
                var percentComplete = (e.loaded / e.total) * 100;
                percentComplete = Math.min(percentComplete, 70);
                $meter.css('width', percentComplete);
              }
            }, false); // For handling the progress of the upload
          }
          return myXhr;
        }
      }).then(
        function (data) {
          app.utils.reloadNavAndPanel();
          app.utils.btnStateChange($saveProfileDetailsButton, 'Save changes', false);
          var progressComplete = 80;
          setIntervalX(function () {
            $meter.css('width', progressComplete);
            progressComplete += 10;
          }, 1000, 3);
          setTimeout(function () {
            if (videoAdded) {
              app.utils.notify('Intro video added succesfully!', 'success', 2);
            }
            //app.utils.reloadNavAndPanel();
            window.location.reload();
          }, 3000);
        },
        function (err) {
          app.utils.btnStateChange($saveProfileDetailsButton, 'Save changes', false);
          $progress.css("display:none;");
          app.utils.notify('We are looking into the issue', 'error', 2);
        }
      );
      switchToNotEditingView();
    }
  });

  // cancel video upload
  $cancelProfileVideoBtn.on('click', function () {
    app.utils.unloadModal($attachedProfileVideoModal);
  });
};