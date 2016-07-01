app.components.homePage = function ($home){

  var $signUp = $home.find('.signUp');
  var $email = $home.find('.email');
  var $password = $home.find('.password'); 
  var $name = $home.find('.name');
  var userLoginDetail = {
    username: null,
    password: null
  }
  var regexNameValidator = /^[ A-Za-z0-9]*$/i;
  var regexEmailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
  $signUp.on('click', function (ev){
    var userExists = false;
    var email = $email.val();
    var isEmailValid = regexEmailValidator.test(email);
    if (!isEmailValid) {
      Materialize.toast('Enter Valid Email', 4000);
      return;
    }
    var name = $name.val();
    var isNameValid = regexNameValidator.test(name);
    if (!isNameValid) {
      Materialize.toast('Name can contain alphabets and numbers only', 4000);
      return;
    }
    app.utils.ajax.post('/widgets/user/exists', {
      data: {
        email: email
      }
    }).then(function (data) {
      if (!data.exists) {
        userExists = data.exists;
        if (!userExists) {
          if ($password.val()) {
            userLoginDetail.username = email;
            userLoginDetail['fullname'] = name;
            userLoginDetail.password = $password.val();
            //console.log(userExists);
              if ((userLoginDetail.password).length >= 6) {
                app.utils.ajax.post('/auth/register', {
                  data: userLoginDetail
                }).then(function () {
                    Materialize.toast('SignUp Successful', 2000);
                    authSuccess();
                  },
                  function () {
                    Materialize.toast('Something went wrong', 4000);
                  })
              } else {
                Materialize.toast('Password should be more than 6 characters', 4000);
              }
            
          } else {
            Materialize.toast('Enter Password', 4000);
          }
        } else {
          Materialize.toast('Email Already Exists', 4000);
        }
      }
    }, function (err) {
      Materialize.toast('Something went wrong', 4000);
    });

  })
  var authSuccess = function (windowName) {
    app.utils.requestDeserializer(app.requestArgs);
    app.requestArgs = {};
    if (app.utils.currentUrl() === app.utils.domain() + '/') {
      app.utils.redirectTo('/discover');
    } else {
      app.utils.reloadNavAndPanel();
    }

    //addTrackingScripts();
  };

  


}