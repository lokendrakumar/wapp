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