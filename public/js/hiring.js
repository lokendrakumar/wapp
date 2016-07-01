'use strict';


// defining 
window.app = window.app === undefined ? {} : window.app;

// setting up commonly used vars
app.vent = $({});
app.campaignId = null;
app.surveyType = null;
app.roleId = null;
app.checkedValues = [];
app.$document = $(document);
app.$window = $(window);
app.$body = $('body');	

// ovverriding navigator for cross browser stuff
navigator.getUserMedia = navigator.getUserMedia ||
                        navigator.webkitGetUserMedia ||
                        navigator.mozGetUserMedia ||
                        navigator.msGetUserMedia;

// defining BEHAVIORS - methods in browser/behaviors
app.behaviors = app.behaviors === undefined ? {} :  app.behaviors;

// defining COMPONENTS - methods in browser/components
app.components = app.components === undefined ? {} : app.components;

// defining UTILITIES - methods in browser/utils
app.utils = app.utils === undefined ? {} : app.utils;

// app in memory cache
app.cache = {};

app.requestArgs = {};
// use this instead of $.ajax
// performs some utility functions too
app.utils.ajax = function (method, url, params) {
  params = params === undefined ? {} : params;
  params.method = method;
  params.url = url;

  return $.ajax(params).always(function (argOne, status, argThree) {
    if (status === 'success') {
      var data = argOne;
      var xhr = argThree;
      var err = undefined;
    } else if (status === 'error') {
      var data = undefined;
      var xhr = argOne;
      var err = argThree;
    }

    // handle authentication modal
    if (xhr.status === 401) {
      app.utils.requestSerializer(method, url, params);
      app.utils.loadModal('#authModal', '/modal/auth');
    }

    // handle behavior for changing nav automatically
    if (method === 'GET' && data && data.nav && typeof(data.nav) === 'string') {
      $('#nav').html(data.nav);
    }

    if (method === 'GET' && data && data.panel && typeof(data.panel) === 'string') {
      $('#panel').html(data.panel)
    }
  });
};

// adding utility methods to app.utils.ajax
['GET', 'PUT', 'POST', 'DELETE'].forEach(function (method) {
  app.utils.ajax[method.toLowerCase()] = function (url, params) {
    return app.utils.ajax(method, url, params);
  };
});
app.utils.btnStateChange = function (button, message, disabled) {
  var $button = button;
  // var imgHtml =  '<img src="/img/preloader.gif" class="left"/>'+
  //                 '<div class="inBtnState">'+
  //                 '</div>';
  
  
  if (disabled) {
    // $button.addClass('fullbtn');
    // $button.html(imgHtml);
    // var $inBtnState = $button.find('.inBtnState');
    $button.html(message);
    
    $button.addClass('disabled');
  } else {
    // $button.removeClass('fullbtn');
    $button.removeClass('disabled');    
    $button.html(message);
  }
  app.utils.domain = function () {
    return [location.protocol, '//', location.host].join('');
  };

  app.utils.redirectTo = function (path) {
   window.location.href = app.utils.domain()+path;
  };

  app.utils.notify = function(text,type,duration){
    
    $('#alert-box').fadeIn().addClass(type).html(text + '<a href="#" class="close">&times;</a>');
    
    //Types are: alert, success, warning, info 
      if (duration!=0){
      setTimeout(function() {
        $('.alert-box').removeClass(type).fadeOut().html('loading <a href="#" class="close">&times;</a>');
      }, duration*1000); 
    }
    $(document).on('close.alert', function(event) {
      $('#alert-hook').html('<div data-alert id="alert-box" class="alert-box-wrapper alert-box alert radius" style="display:none;"> Loading... <a href="#" class="close">&times;</a> </div>');
    });
  };

};


app.components.hiringLeftPane = function ($leftPane) {

  var $campaignId = $leftPane.find('.campaign')
  var $openCompanyModal = $leftPane.find('.open-create-company-modal');
  var $openEditModal = $leftPane.find('.open-edit-compaign-modal');
  var $openDeleteModal = $leftPane.find('.open-delete-compaign-modal');
  var $createCampaign = $leftPane.find('.create-campaign-modal');
  var $editCampaignModal =$leftPane.find('.edit-campaign-modal');
  var $deleteCampaignModal =$leftPane.find('.delete-Campaign-modal');
  var $compaignDropDown = $leftPane.find('.campaign-dropdownMenu');
  var $buttonCreateCampaign = $leftPane.find('.button-create-campaign');
  var $updateCampaign = $leftPane.find('.button-update-campaign');
  var $deleteOkButton = $leftPane.find('.delete-okay-button');
  var $companyNameError = $leftPane.find('.company-name-error-label');
  var $inputCompanyName = $leftPane.find('.company-name-input');
  var $updateCompaignName = $leftPane.find('.update-company-name');
  var $updateCompaignDesc = $leftPane.find('.update-company-desc');
  var $uploadLogo = $leftPane.find('.upload-campaign-logo');
  
  
  var $loadingModal = $leftPane.find('.loading-modal');
  $compaignDropDown.on("click", "li a", function () {
    var platform = $(this).text();
    $leftPane.find('#campaign-dropdown_title').html(platform);
    $leftPane.find('#campaign-printPlatform').html(platform);
  });

  $openCompanyModal.on("click", function () {

    $createCampaign.modal('show');
  });

  $uploadLogo.on('change',function() {
    var $uploadLogo = $leftPane.find('.upload-campaign-logo');
    var Logo  = $uploadLogo[0].files[0];
    var userId = $uploadLogo.data('user-id');
    var formdata = new FormData();
    formdata.append("image",Logo);
    formdata.append('userId',userId) 
    app.utils.ajax.post('/dashboard/upload-logo', {
        data:formdata,
        processData: false,
        contentType: false
    }).then(function (data) {
      //console.log(data)
      window.location.reload();

    });

  });

  $campaignId.on("click", function () {

    //open loading modal
    var platform = $(this).text();
    app.surveyType = $(this).data('survey-type-id');
    app.campaignId = $(this).data('id');
    app.utils.ajax.get('/dashboard', {
      data: {
        campaignId: app.campaignId,
        partials: ['rightPane'],
        surveyType: app.surveyType,
      }
    }).then(function (data) {

      $('.hiringRightPane').replaceWith(data.rightPane);
      $('.edit-profile').prop('disabled', true);
      $('.delete-profile').prop('disabled', true);
      
    });
  });

  $inputCompanyName.keydown(function () {
    $companyNameError.hide();
  });

  $buttonCreateCampaign.on('click', function () {
    var companyInputName = $inputCompanyName.val();
    var companyInputDesc = $leftPane.find('.company-desc-input').val();

    if (companyInputName) {
      app.utils.btnStateChange($buttonCreateCampaign, 'Creating...', true);
       var url =  window.location.hostname;
         if(url == 'hiring.frankly.me'){
          url = 'hiring';
         }
         else{
          url = 'audition';
         }
      app.utils.ajax.post('/dashboard/create-campaign', {
        data: {
          companyName: companyInputName,
          companyDesc: companyInputDesc,
          surveyType: url
        }
      }).then(function (data) {
        $createCampaign.modal('hide');
        $createCampaign.on('hidden', function () {
          $(this).remove();
        });
        window.location.reload();
      }, function (err) {
        app.utils.btnStateChange($buttonCreateJob, 'Create a Job', false);
        console.log(err);
      });

    } else {
      $companyNameError.show();
    }
  });
  //edit campaign
  $openEditModal.on('click',function (){

    if(app.campaignId){
       app.utils.ajax.post('/dashboard/edit-compaign', {
        data: {
          campainId: app.campaignId,
        }
      }).then(function (data) {

        $updateCompaignDesc.val(data.survey_entry.description);
        $updateCompaignName.val(data.survey_entry.title);
        $editCampaignModal.modal('show');
      }, function (err) {
        console.log(err);
      });
    }
   
  });
  $updateCampaign.on('click', function(){

    var companyInputName = $updateCompaignName.val();
    var companyInputDesc = $updateCompaignDesc.val();

    app.utils.ajax.get('/dashboard/update-compaign', {
        data: {
          campainId: app.campaignId,
          campaignTitle: companyInputName,
          campaignDesc: companyInputDesc
        }
      }).then(function (data) {
        $editCampaignModal.modal('hide');
       
        window.location.reload();
      }, function (err) {
        //app.utils.btnStateChange($buttonCreateJob, 'Create a Job', false);
        console.log(err);
      });

  })

  //delete campaign
  $openDeleteModal.on('click', function(){
    if(app.campaignId){
      $deleteCampaignModal.modal('show');
    }
  });

  $deleteOkButton.on('click', function(){

    app.utils.ajax.get('/dashboard/delete-campaign', {
        data: {
          campainId: app.campaignId,
        }
      }).then(function (data) {
        $deleteCampaignModal.modal('hide');
        window.location.reload();
      }, function (err) {
        console.log(err);
      });

  })



}; 
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

app.components.hiringTableHeader = function($tableHeader){

  // var $sortingSpan = $tableHeader.find('.sorting-dropdown');
  // var $sortingType = $tableHeader.find('.sorting-type');



  //   $sortingSpan.on('click',function(event) {

  //     var sortingId = $(this).data('sorting-id');
  
  //   });
  //   $sortingType.on('click', function(evt){

  //     var sortyingBy = $(this).data('sorting-type');
  //   })

}
app.components.TopController = function($top) {

  var $logOutBtn =$top.find('.logout') 
  $logOutBtn.on('click', function (ev) {
    ev.preventDefault();
    app.utils.ajax.post("/logout").then(function (){

      window.location.replace(window.location.protocol + '//'+ window.location.hostname +'/auth/login?from=/dashboard');
      app.utils.notify('Logged Out', 'success', 10);
    });
  });
}
app.components.surveyVideoAnswers = function ($answerVideoCard) {

  var $overlay = $answerVideoCard.find('.overlay');
  var $overlayPlayIcon = $answerVideoCard.find('.overlay-play-icon')
  var $video = $answerVideoCard.find('video');
  var currentOpacity = $overlay.css('opacity');

  $overlayPlayIcon.on('click', function (ev) {
    ev.preventDefault();
    $overlay.fadeTo(400,0, function () {
      $overlay.css({display: 'none'});
    });
    $video[0].play();
  });

  $video.on('click pause', function (ev) {
    ev.preventDefault();
    $video[0].pause();
    $overlay.css({display: 'block'});
    $overlay.fadeTo(400, currentOpacity);
  });

}
app.components.hiringTableContent = function ($tableContent) {

  var $tableCheckBox = $tableContent.find('.table-checkbox');
  var $buttonViewAnswer = $tableContent.find('.button-view-answer');

  function showLoadingModal(message) {
    $('.loading-modal').find($('.modal-body h4')).html(message);
    $('.loading-modal').modal('show');
  }

  function hideLoadingModal() {
    $('.loading-modal').modal('hide');
    $('.loading-modal').removeClass("in");
    $(".modal-backdrop").remove();
  }

  $tableCheckBox.on("click", function () {
    $('.manage').css("display", "block");

    var totalCheckBoxesLength = $('.table-checkbox').length;
    var totalCheckedBoxesLength = $('.table-checkbox:checked').length;

    if (totalCheckedBoxesLength === totalCheckBoxesLength) {
      if (!$('.select-all').is(":checked"))
        $('.select-all').prop('checked', true);
    }
    else {
      if ($('.select-all').is(":checked"))
        $('.select-all').prop('checked', false);
    }

    app.checkedValues = $('input:checkbox:checked').map(function () {
      return this.value;
    }).get();
    if (app.checkedValues < 1) {
      $('.manage').css("display", "none");
    }
  });

  $buttonViewAnswer.on('click', function (event) {
    //event.stopPropagation();
    event.preventDefault()
    var buttonId = $(this).data('id');
    var videoWillBeInsertedHere = $('#' + buttonId);
    if ($(this).html() == "View Answer") {
      showLoadingModal("Loading Video Answers");
      videoWillBeInsertedHere.attr('disabled', 'disabled');
      app.utils.ajax.get('/dashboard/get-video-answers', {
        data: {
          surveyId: app.campaignId,
          profileId: $(this).data('profile-id'),
          participantId: $(this).data('id')
        }
      }).then(function (data) {
        videoWillBeInsertedHere.parent().parent().after('<tr id=videoAnswer' + buttonId + '><td></td><td colspan="11">' +
          data + '</td></tr>');
        hideLoadingModal();
        videoWillBeInsertedHere.removeAttr('disabled');
        videoWillBeInsertedHere.html('Hide Answer');
      }, function (err) {
        console.log(err);
      });
    } else {
      event.preventDefault();
      $('#videoAnswer' + buttonId).remove();
      videoWillBeInsertedHere.html('View Answer');
    }
  });

};