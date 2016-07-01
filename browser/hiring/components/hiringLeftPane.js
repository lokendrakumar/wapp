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