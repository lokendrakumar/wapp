app.components.resetPassword = function ($resetPassword) {
  var $newPasswordInput = $resetPassword.find('.newPassword');
  var $confirmNewPasswordInput = $resetPassword.find('.confirmNewPassword');
  var $resetPasswordBtn = $resetPassword.find('.reset-password-btn');
  var $passwordBlankMessage = $resetPassword.find('.passwordBlankMessage');
  var $confirmPasswordBlankMessage = $resetPassword.find('.confirmPasswordBlankMessage');
  var $passwordNotMatchingMessage = $resetPassword.find('.passwordMatchError');
  var resetToken = $resetPassword.data('token');

  $resetPasswordBtn.on('click', function () {
    if ($newPasswordInput.val().length === 0 || !$newPasswordInput.val().toString().trim()) {
      $passwordBlankMessage.slideDown('slow');
    }
    else if ($confirmNewPasswordInput.val().length === 0 || !$confirmNewPasswordInput.val().toString().trim()) {
      $confirmPasswordBlankMessage.slideDown('slow');
    } else if (
      $newPasswordInput.val().toString() !== $confirmNewPasswordInput.val().toString() ||
      $newPasswordInput.val().length === 0 || !$newPasswordInput.val().toString().trim()
    ) {
      $passwordNotMatchingMessage.slideDown('slow');
    } else {
      app.utils.ajax.post('/reset-password', {
        data: {
          password: $newPasswordInput.val(),
          resetToken: resetToken
        }
      }).then(
        function (data) {
          app.utils.redirectTo('/auth/login');
        },
        function (err) {
          alert('Something bad occurred. We are looking into the issue');
        }
      );
    }
  });

  $newPasswordInput.keydown(function (ev) {
    $passwordBlankMessage.slideUp('slow');
    $passwordNotMatchingMessage.slideUp('slow');
  });

  $confirmNewPasswordInput.keydown(function (ev) {
    $confirmPasswordBlankMessage.slideUp('slow');
    $passwordNotMatchingMessage.slideUp('slow');
  });
};