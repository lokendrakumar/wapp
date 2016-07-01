module.exports = {

  dashboardObj: function () {
    var url = this.url;
    if (url === 'hiring.frankly.me') {

      var hiringObj = {
        Title:'Profile',
        Select_Campaign: 'Select Campaign',
        Create_Profile: 'Create Profile',
        Edit_Profile: 'Edit Profile',
        All_Profiles: 'All Profiles',
        Create_Profile_Heading: 'Create Profile',
        Create_Profile_Name_Placeholder: 'Job title e.g Android Developer',
        Create_Profile_Description_Placeholder: 'Job Description',
        Button_Create_text: 'Create Profile',
        Button_Delete_text: 'Delete Profile',
        Details: {
          Name: 'Name',
          PhoneNumber: 'PhoneNumber',
          Email: 'Email',
          Experience: 'Year', //'Experience',
          College: 'College',
          PreviousCompany: 'Stream',//'Previous Company'
        },
        CongratsMessage: 'You have successfully created your Job Card',
        Edit_Profile_Heading: 'Edit Profile',
        Edit_Profile_Button_Text: 'Update Profile'
      }
      return hiringObj;
    }
    else {
      var AuditionObj = {
        Title:'Audition',
        Select_Campaign: 'Select Audition',
        Create_Profile: 'Create Audition',
        Edit_Profile: 'Edit Audition',
        All_Profiles: 'All Auditions',
        Create_Profile_Heading: 'Create Audition',
        Create_Profile_Name_Placeholder: 'Audition title e.g Dancing Audition',
        Create_Profile_Description_Placeholder: 'Audition Description',
        Button_Create_text: 'Create Audition',
        Button_Delete_text: 'Delete Audition',
        Details: {
          Name: 'Name',
          PhoneNumber: 'PhoneNumber',
          Email: 'Email',
          Experience: 'State',
          College: 'Previous City',
          PreviousCompany: 'Current City'
        },
        CongratsMessage: 'You have successfully created your Audition Card',
        Edit_Profile_Heading: 'Edit Audition',
        Edit_Profile_Button_Text: 'Update Audition'
      }
      return AuditionObj;
    }
  }
};