app.components.answerableQuestionCard = function ($questionCard) {

  var $addAnswerButton = $questionCard.find('.dvAddAnswerButton');
  var $answerVideoPane = $questionCard.find('.dvVideoPane');
  var $questionCardMediaPane = $questionCard.find('.dvVideoPane');
  var $spanYou = $questionCard.find('.spanYou');
  var $spanUpvotes = $questionCard.find('.spanUpvotes');
  var $upvoteText = $questionCard.find('.upvoteText');
  var upvotes = parseInt($spanUpvotes.html());

  /*Toggle slide of the answer video pane*/
  $addAnswerButton.click(function () {
    if ($.trim($addAnswerButton.html()) === 'Not Now') {
      $answerVideoPane.slideUp("slow");
      $addAnswerButton.html('Add Answer');
    } else if ($.trim($addAnswerButton.html()) === 'Add Answer') {
      $answerVideoPane.slideDown("slow");
      $addAnswerButton.html('Not Now');
    } else {
    }
  });

  /**
   * Now we come to questionCardMediaFiles. We create an object in which we will
   * store the video+audio files to be uploaded
   */

  var questionCardMediaFiles = {

    audio: null,
    video: null,
    mediaSize: null
  };

  /**
   * tackle the behavior for attaching video
   */
  var $attachedQuestionCardVideoInput = $questionCardMediaPane.find('input[name="questionCardVideo"]');
  var $attachedQuestionCardVideoModal = $('#' + $questionCard.data('attached-video-modal-id'));
  app.behaviors.video($attachedQuestionCardVideoModal.find('video'));

  var $uploadAttachedVideo = $attachedQuestionCardVideoModal.find('.uploadVideoButton');
  var $cancelVideo = $attachedQuestionCardVideoModal.find('.rejectVideoButton');

  $attachedQuestionCardVideoInput.on('change', function (ev) {
    var video = $attachedQuestionCardVideoInput[0].files[0];

    if (video === undefined) return;

    if (video.size > (50 * 1024 * 1024)) {
      app.utils.notify('File Size extending 50 MB limit', 'error', 2);
    } else {

      questionCardMediaFiles.video = video;
      // now that we are sure we have a file, we need to open a goddamn modal
      // for user preview
      var reader = new FileReader();
      reader.readAsDataURL(video);
      reader.onload = function (ev) {
        var videoUrl = ev.target.result;
        $attachedQuestionCardVideoModal.find('video').attr('src', videoUrl);
        $attachedQuestionCardVideoModal.find('video').trigger('croptofit');
        $attachedQuestionCardVideoModal.find('video')[0].play();
        app.utils.loadModal($attachedQuestionCardVideoModal);
      };
    }
  });

  /**
   * tackle the behaviour for capturing the video for each card
   */
  var $questionCardVideoCaptureBtn = $answerVideoPane.find('.dvRecordVideo');
  var $questionCardVideoCaptureModal = $('#' + $questionCard.data('capture-video-modal-id'));
  app.behaviors.video($questionCardVideoCaptureModal.find('video'), false);

  $questionCardVideoCaptureBtn.on('click', function (ev) {
    navigator.getUserMedia({video: true, audio: true}, function (stream) {
      var $video = $questionCardVideoCaptureModal.find('video');
      $video[0].volume = 0;
      $video.attr('src', window.URL.createObjectURL(stream));

      /**
       * load modal with video playing
       */
      app.utils.loadModal($questionCardVideoCaptureModal, null, function () {
        /**
         * Record btn handler
         */
        var modalHasBeenClosed = false;
        var recorderStopped = false;
        var recorder = null;
        var $recordBtn = $questionCardVideoCaptureModal.find('.recordBtn');
        var $timePlayedDisplay = $questionCardVideoCaptureModal.find('span.time-played');
        var timePlayedInterval = null;

        var recordHandler = function (ev) {
          ev.preventDefault();
          if ($recordBtn.find('i').hasClass('icon-record')) {
            // modify this line for firefox compatibility

            recorder = new MultiStreamRecorder(stream);
            ////////////////////////////////////////
            /// max video time : 1.5 minutes, average length of a smoke
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
            $recordBtn.find('span.recordVideo').html("Stop");
          } else {

            clearInterval(timePlayedInterval);
            $timePlayedDisplay.html('0:00');

            $recordBtn.find('i').removeClass('icon-stop').addClass('icon-record')
            $recordBtn.find('span.recordVideo').html("Record");
            recorder.ondataavailable = function (data) {
              if (!modalHasBeenClosed) {

                // Store the recorded video and audio data into the media object
                questionCardMediaFiles.audio = app.utils.blobToFile(data.audio, 'recordAudio');
                questionCardMediaFiles.video = app.utils.blobToFile(data.video, 'recordVideo');
                questionCardMediaFiles.mediaSize = data.audio.size + data.video.size;
                // Now we can to the necessary shit

                var audioSrc = window.URL.createObjectURL(questionCardMediaFiles.audio);
                var videoSrc = window.URL.createObjectURL(questionCardMediaFiles.video);

                $attachedQuestionCardVideoModal.find('audio').attr('src', audioSrc);
                $attachedQuestionCardVideoModal.find('video').attr('src', videoSrc);
                $attachedQuestionCardVideoModal.find('audio')[0].play();
                $attachedQuestionCardVideoModal.find('video')[0].play();

                recorderStopped = true;

                app.utils.unloadOpenModals(function () {
                  app.utils.loadModal($attachedQuestionCardVideoModal, null, function () {
                    $attachedQuestionCardVideoModal.find('video').trigger('croptofit');
                    /**
                     * attach modal close handler
                     */
                    var modalCloseHandler = function (ev, closedModal) {
                      if ($attachedQuestionCardVideoModal[0] === closedModal) {
                        $attachedQuestionCardVideoModal.find('video')[0].pause();
                        $attachedQuestionCardVideoModal.find('audio')[0].pause();
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
          if (closedModal === $questionCardVideoCaptureModal[0]) {
            modalHasBeenClosed = true;
            if (!recorderStopped) {
              recorder && recorder.stop();
              stream && stream.stop();
            }
            app.vent.off('modal.closed', modalCloseHandler);
            $recordBtn.off('click', recordHandler);
          }
        };

        app.vent.on('modal.closed', modalCloseHandler);

      });
    }, function (err) {
      alert('Allow your webcam to record the video');

    });

  });
  /**
   * share button functionality
   */
  var shareSelector = '#icon-share-' + $questionCard.attr('id');
  var $shareIcon = $questionCard.find(shareSelector);
  app.behaviors.shareBtn(shareSelector, $shareIcon);

  var submitAnswerOfQuestionCard = function () {
    if (questionCardMediaFiles.mediaSize > (50 * 1024 * 1024)) {
      app.utils.notify('File Size extending 50 MB limit', 'error', 2);
    } else {
      app.utils.btnStateChange(
        $uploadAttachedVideo,
        'Working',
        true
      );

      $addAnswerButton.addClass('disabled');
      $addAnswerButton.off('click');

      var $progressBarHolder = $questionCard.find('.progressBarHolder');
      var $progressBar = $progressBarHolder.find('span');
      $progressBarHolder.fadeIn('slow');

      var setIntervalX = function (callback, delay, repetitions) {
        var x = 0;
        var intervalID = setInterval(function () {
          callback();
          if (++x === repetitions) {
            window.clearInterval(intervalID);
          }
        }, delay);
      };

      var formData = new FormData;
      formData.append('audio', questionCardMediaFiles.audio);
      formData.append('video', questionCardMediaFiles.video);
      formData.append('questionId', $questionCard.data('question-id'));
      formData.append('answerType', " ");
      formData.append('lat', null);
      formData.append('lon', null);
      formData.append('tags', null);
      // xhr.open('POST', 'http://localhost:3000/upload', true);
      // xhr.send(formData);

      app.utils.ajax.post('/me/upload-answer', {
        data: formData,
        processData: false,
        contentType: false,
        xhr: function () {  // Custom XMLHttpRequest
          var myXhr = new window.XMLHttpRequest();
          if (myXhr.upload) { // Check if upload property exists
            myXhr.upload.addEventListener('progress', function (e) {
              if (e.lengthComputable) {
                var percentComplete = (e.loaded / e.total) * 100;
                percentComplete = Math.min(percentComplete, 70);
                $progressBar.css('width', percentComplete + '%');
              }
            }, false); // For handling the progress of the upload
          }
          return myXhr;
        }
      }).then(
        function (data) {
          app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
          var progressComplete = 80;
          setIntervalX(function () {
            $progressBar.css('width', progressComplete + '%');
            progressComplete += 10;
          }, 1000, 3);
          setTimeout(function () {
            app.utils.unloadModal($attachedQuestionCardVideoModal);
            app.utils.notify('Video response added succesfully!', 'success', 2);
            //app.utils.reloadNavAndPanel();
            window.location.reload();
          }, 3000);
        },
        function (err) {
          app.utils.btnStateChange($uploadAttachedVideo, 'Add Video', false);
          $uploadAttachedVideo.html('Add Video');
          $uploadAttachedVideo.removeClass('disabled');
          $cancelVideo.removeClass('disabled');
        }
      );
    }
  };

  $uploadAttachedVideo.on('click', function () {
    app.utils.unloadModal($attachedQuestionCardVideoModal);
    submitAnswerOfQuestionCard();
  });

  $cancelVideo.on('click', function () {
    app.utils.unloadModal($attachedQuestionCardVideoModal);
  });

  if (upvotes <= 0) {
    $upvoteText.hide();
  } else {
    $upvoteText.show();
  }

  /**
   * Report User Functionality
   */
  var $reportButton = $questionCard.find('.report-user');
  app.behaviors.report($reportButton);

};


