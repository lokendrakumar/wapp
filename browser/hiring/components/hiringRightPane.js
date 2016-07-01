app.components.hiringRightPane = function ($rightPane) {

  var $currentRole = $rightPane.find('.hiring-current-role');
  var $hiringCurrentRole = $rightPane.find(".hiring-current-role");
  var $dropdownMenu = $rightPane.find('.dropdownMenu');
  var $manage = $rightPane.find(".manage");
  var $table = $rightPane.find('.hiring-dynamic-table');
  var $downloadExcel = $rightPane.find('.download-excelsheet');
  var $selectAllCheckboxBtn = $rightPane.find('.select-all');
  var $candidateStatus = $rightPane.find('.candidate-status');
  var $tableScrollBody = $rightPane.find('.table-scroll-body');
  var $tableCheckBox = $rightPane.find('.table-checkbox');

  var $editProfileModal = $rightPane.find('.edit-job-modal');
  var $editCongratsModal = $rightPane.find('.edit-congrats-modal');
  var $editProfileTitleInput = $rightPane.find('.edit-job-title-input');
  var $buttonEditProfile = $rightPane.find('.edit-profile');
  var $buttonUpdateJob = $rightPane.find('.button-update-job');
  var $editQuestionModal = $rightPane.find('.edit-question-modal');
  var $putQuestionDiv = $rightPane.find('.edit-question-modal-body');
  var $editQuestionTextarea = $rightPane.find('.edit-modal-text-area');
  var $buttonEditQuestionFinish = $rightPane.find('.button-edit-question-finish');
  var $buttonFinishOkayModal = $rightPane.find('.edit-okay-button');
  var $deleteProfile = $rightPane.find('.delete-profile');
  var $getWidget = $rightPane.find('.get-widget');
  var currentUsername = $getWidget.data('username');


  var $buttonCreateProfile = $rightPane.find('.create-profile');
  var $errorJobName = $rightPane.find('.job-name-required');
  var $inputJobTitle = $rightPane.find('.job-title-input');
  var $errorAddQuestion = $rightPane.find('.error-add-question');
  var $inputTextArea = $rightPane.find('.modal-text-area');
  var $buttonCreateJob = $rightPane.find('.create-job-button');
  var $jobModalFinishButton = $rightPane.find('.next-button-to-congrats');
  var $jobModalOkayButton = $rightPane.find('.okay-button');
  var $addQuestionButton = $rightPane.find('.button-add-question');
  var $inputJobDescription = $rightPane.find('.job-description-input');
  var $editProfileDescInput = $rightPane.find('.edit-job-description-input');
  var $tableCheckBox = $rightPane.find('.table-checkbox');
  var jobId = null;

  var $addJobModal = $rightPane.find('.add-job-modal');
  var $writeQuestionModal = $rightPane.find('.write-question-modal');
  var $congratsModal = $rightPane.find('.congrats-modal');
  var $tableScroll = $rightPane.find('.table-scroll');

  var $deleteProfileModal = $rightPane.find('.delete-profile-modal');
  var $deleteOkBtn = $rightPane.find('.delete-okay-button');
  var $deleteNoButton = $rightPane.find('.delete-no-button');

  var $widgetModal = $rightPane.find('.widget-modal');
  var $widgetModalTextAreaJS = $widgetModal.find('.widget-modal-text-area-js');
  var $widgetModalTextAreaHTML = $widgetModal.find('.widget-modal-text-area-html');


  var jobRoleEditing = null;

  var $loadingModal = $rightPane.find('.loading-modal');

// Get Survey widget
  $getWidget.on('click', function (ev) {
    var jsCodeText = '<script src="https://frankly.me/js/franklywidgets.js"> </script>';
    var htmlCodeText = '<div class="franklywidget"data-user="'+ currentUsername +'" data-widget="survey"' +
      'data-query="'+ app.campaignId +'" data-height="220" data-width="220" style="margin: auto">' +
      '<a href="https://frankly.me">Frankly.me</a></div>';
    $widgetModal.modal('show');
    $widgetModalTextAreaJS.val(jsCodeText);
    $widgetModalTextAreaHTML.val(htmlCodeText);
  });

  function showLoadingModal(message) {
    $loadingModal.find('.modal-body h4').html('Loading ' + message);
    $loadingModal.modal('show');
  }

  function hideLoadingModal() {
    $loadingModal.modal('hide');
    $loadingModal.removeClass("in");
    $(".modal-backdrop").remove();
  }

  $downloadExcel.on('click', function () {
    $table.table2excel({
      exclude: '.noExl',
      name: 'hiring'
    });
  });

  $currentRole.on('click', function () {
    app.roleId = $(this).data('role-id');

    var platform = $(this).text();
    showLoadingModal(platform);

    app.utils.ajax.get('/dashboard/get-role-applicants', {
      data: {
        roleId: app.roleId,
        campaignId: app.campaignId,
        surveyType: app.surveyType,
        partials: ['rightPane']
      }
    }).then(function (data) {
      console.log(data);
      //$loader.css("display", "none");
      hideLoadingModal();
      $rightPane.replaceWith(data.rightPane);
      if (app.roleId) {
        $('.edit-profile').prop('disabled', false);
        $('.delete-profile').prop('disabled', false);
      }
      else {
        $('.edit-profile').prop('disabled', true);
        $('.delete-profile').prop('disabled', true);
      }
      $('.edit-profile').show();//$buttonEditProfile not available
      $("#dropdown_title").html(platform);
    });
  });

  $dropdownMenu.on("click", "li a", function () {
    var platform = $(this).text();
    $rightPane.find("#dropdown_title").html(platform);
    $rightPane.find('#printPlatform').html(platform);
  });

  $hiringCurrentRole.on("click", function () {
    $manage.css("display", "none");
  });

  $buttonEditProfile.on('click', function () {
    $editProfileModal.modal('show');
    app.utils.ajax.get('/dashboard/edit-profile', {
      data: {
        profileId: app.roleId,
        campaignId: app.campaignId
      }
    }).then(
      function (data) {
        $editProfileModal.modal('show');
        jobRoleEditing = data.survey_profile;
        $editProfileTitleInput.val(data.survey_profile.display_name);
        $editProfileDescInput.val(data.survey_profile.description);
      },
      function (err) {
        console.log(err);
      });
  });

  $deleteProfile.on('click', function () {
    $deleteProfileModal.modal('show');

  });

  $deleteOkBtn.on('click', function () {
    app.utils.ajax.post('/dashboard/delete-profile', {
      data: {
        profileId: app.roleId,
        campaignId: app.campaignId
      }
    }).then(
      function (data) {
        $deleteProfileModal.modal('hide');
        window.location.reload();
      },
      function (err) {
        console.log(err);
      });
  });

  $deleteNoButton.on('click', function () {
    $deleteProfileModal.modal('hide');
  })
 
  $buttonUpdateJob.on('click', function () {
    
    app.utils.ajax.post('/dashboard/update-profile', {
      data: {
        campaignId: app.campaignId,
        roleId: app.roleId,
        roleName: $editProfileTitleInput.val(),
        roleDesc: $editProfileDescInput.val()
      }
    }).then(function (data) {
        if (data.success) {
          $editProfileModal.modal('hide');
             getQuestions();
        } else {
          return;
        }
      },
      function (err) {
        console.log(err);
      });
  });
   var isQuestionAppended = false;
  function getQuestions() {
    app.utils.ajax.get('/dashboard/edit-questions', {
      data: {
        campaignId: app.campaignId,
        roleId: app.roleId
      }
    }).then(function (data) {
      var existedQuestion = $putQuestionDiv.find('.question-div');
      var existedQuestionLength = existedQuestion.length;
      for(var i=0;i<existedQuestionLength;i++){
          existedQuestion[i].remove();
      }
      $editQuestionModal.modal('show');
      if(!isQuestionAppended){
        data.forEach(function (question) {
          var $questionDiv = $("<div>", {
            class: "question-div"
          });
          $questionDiv.data('id', question.survey_question.id);
          $questionDiv.html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + question.survey_question.question_body);
          $questionDiv.find('.close').on('click', function () {
            var id = $questionDiv.data('id');
            $questionDiv.remove();
            removeQuestion(id);
          });
          $putQuestionDiv.prepend($questionDiv);
          isQuestionAppended = true;
        });
      }
      
    }, function (err) {
      console.log(err);
    });
  }

  function removeQuestion(questionId) {
    app.utils.ajax.post('/dashboard/delete-question', {
      data: {
        campaignId: app.campaignId,
        roleId: app.roleId,
        questionId: questionId
      }
    }).then(function (data) {
      console.log(data);
    }, function (err) {
      console.log(err);
    });
  }

  $addQuestionButton.on('click', function () {
    var questionId = null;
    if ($editQuestionTextarea.val()) {
      app.utils.ajax.post('/dashboard/add-questions', {
        data: {
          profileId: app.roleId,
          campaignId: app.campaignId,
          question: $editQuestionTextarea.val()
        }
      }).then(function (data) {

          var $questionDiv = $("<div>", {
            class: "question-div"
          });
          $questionDiv.data('id', data.id);
          $questionDiv.html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + $editQuestionTextarea.val());
          $questionDiv.find('.close').on('click', function () {
            $questionDiv.remove();
            removeQuestion($questionDiv.data('id'));
          });
          $putQuestionDiv.prepend($questionDiv);
          $editQuestionTextarea.val('');
        },
        function (err) {
          console.log(err);
        });
    } else {
      $errorAddQuestion.show();
    }
  });

  $buttonEditQuestionFinish.on('click', function () {
    $editQuestionModal.modal('hide');
    $editCongratsModal.modal('show');
  });

  $buttonFinishOkayModal.on('click', function () {
    $editCongratsModal.modal('hide');
  });

  /**
   * create job modal
   */

  $inputJobTitle.keydown(function () {
    $errorJobName.hide();
  });

  $inputTextArea.keydown(function () {
    $errorAddQuestion.hide();
  });

  $buttonCreateProfile.on('click', function () {
    $addJobModal.modal('show');
  });

  $buttonCreateJob.on('click', function () {

    var jobTitleInput = $inputJobTitle.val();
    var jobDescriptionInput = $inputJobDescription.val();
    if (jobTitleInput) {

      app.utils.btnStateChange($buttonCreateJob, 'Creating Job...', true);

      app.utils.ajax.post('/dashboard/create-a-job', {
        data: {
          jobTitle: jobTitleInput,
          campaignId: app.campaignId,
          jobDesc: jobDescriptionInput
        }
      }).then(function (data) {
        jobId = data.card.id;
        $addJobModal.modal('hide');
        $addJobModal.on('hidden', function () {
          $(this).remove();
        });
        $writeQuestionModal.modal('show');
        $writeQuestionModal.css('margin-right', '-15px');
        $addJobModal.css('margin-right', '-15px');
      }, function (err) {
        app.utils.btnStateChange($buttonCreateJob, 'Create a Job', false);
        console.log(err);
      });
    } else {
      $errorJobName.show();
    }
  });

  $jobModalFinishButton.on('click', function () {
    app.utils.btnStateChange($buttonCreateJob, 'Finishing...', true);
    $writeQuestionModal.modal('hide');
    $writeQuestionModal.on('hidden', function () {
      $(this).remove();
    });
    $congratsModal.modal('show');
    $writeQuestionModal.css('margin-right', '-15px');
  });

  $jobModalOkayButton.on('click', function () {
    $congratsModal.modal('hide');
    $congratsModal.on('hidden', function () {
      $(this).remove();
    });
    window.location.reload();
  });

  $addQuestionButton.on('click', function () {

    if ($inputTextArea.val()) {

      var $questionDiv = $("<div>", {
        class: "question-div"
      });
      $questionDiv.html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + $inputTextArea.val());
      $questionDiv.find('.close').on('click', function () {
        $questionDiv.remove();
      });
      $rightPane.find('.add-question-modal-body').prepend($questionDiv);

      app.utils.ajax.post('/dashboard/add-questions', {
        data: {
          profileId: jobId,
          campaignId: app.campaignId,
          question: $inputTextArea.val()
        }
      }).then(function (data) {
        $inputTextArea.val('');
      }, function (err) {
        app.utils.btnStateChange($buttonCreateJob, 'Create a Job', false);
        console.log(err);
      });
    } else {
      $errorAddQuestion.show();
    }
  });
  $selectAllCheckboxBtn.on('click', function () {
    if (this.checked) {
      $tableCheckBox.each(function () {
        this.checked = true;
      });
      app.checkedValues = $('input:checkbox:checked').map(function () {
        return this.value;
      }).get();
      $manage.css("display", "block");
    } else {
      $tableCheckBox.each(function () {
        this.checked = false;
        app.checkedValues = [];
      });
      $manage.css("display", "none");
    }
  });

  $candidateStatus.on("click", function () {
    var status = $(this).data('status-id');
    var batchArry = [];
    for (var i = 0; i < app.checkedValues.length; i++) {
      var candidateId = app.checkedValues[i];
      var postOb = {};
      postOb[app.checkedValues[i]] = {
        "status": status
      };
      batchArry = batchArry.concat(postOb);
    }
    app.utils.ajax.get('/dashboard/change-applicants-status', {
      data: {
        batchArry: batchArry,
        campaignId: app.campaignId
      }
    }).then(function (data) {
      for (var i = 0; i < app.checkedValues.length; i++) {
        $("#status" + app.checkedValues[i]).html(status);
        $('#checkbox' + app.checkedValues[i]).attr('checked', false);
      }
      $manage.css("display", "none");
      if ($selectAllCheckboxBtn.is(":checked")) {
        $selectAllCheckboxBtn.attr('checked', false);
      }
    });
  });
  var ajaxcall = true;
  $tableScroll.bind('scroll', function () {
    var $tableBody = $rightPane.find('.table-content').toArray();
    var tableBodyLength = $tableBody.length;
    $tableBody = $tableBody[tableBodyLength - 1];

    //var nextIndex = $tableBody.attributes[2].value;
    var nextIndex = parseInt($tableBody.dataset.nextindex);
    if (nextIndex > 1) {
      if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight && ajaxcall) {
        ajaxcall = false;
        app.utils.ajax.get('/dashboard/get-table-onscroll-content', {
          data: {
            roleId: app.roleId,
            campaignId: app.campaignId,
            surveyType: app.surveyType,
            nextIndex: nextIndex
          }
        }).then(function (data) {
          var correctData = data.replace("<head/>", "");
          $tableScrollBody.append(correctData);
          ajaxcall = true;
        });
      }
    }
  });
}
