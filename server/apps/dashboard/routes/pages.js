var app = module.exports = require('express')();
var _ = require('lodash');
var pages = require('apps/dashboard/pages');
var fn = require('fn');
var api = require('api');
var view = require('view').prefix('dashboard');
var htmlResponse = fn.views.htmlResponse;
var getSurveyAllData = fn.data.getSurveyAllData;
var getTableData	= fn.data.getTableData;
var fs = require('fs');
var config = require('config');


app.get('/', function(req, res) {
	if(req.user) {
		var dashboardObj = require('./dashboardLocale');
		dashboardObj.url = req.get('host');
		var campaignId = req.query.campaignId;
		getSurveyAllData(req.token, campaignId).then(function (data) {
			var args = {			
				pageName: 'Hiring',
				Title: 'Hiring DashBoard',
				partials: pages.hiring,
				roles: data.surveyInfo != 'login' ? data.surveyInfo.survey_entry.radio_panel : 'login',
				applicants: data.allApplicants != 'login' ? data.allApplicants.applicants : 'login',
				surveyList: data.surveyList.survey,
				surveyType: req.query.surveyType,
				nextIndex:data.allApplicants.next_index,
				dashboardObj:dashboardObj.dashboardObj(),
			};
			htmlResponse(req, res, pages.hiring, args);
		}, function (err) {
			console.log(err);
		});	
	} else {
		res.redirect('/auth/login?from=/dashboard');
	}
});

app.get('/get-role-applicants', function(req, res) {
	
	var dashboardObj = require('./dashboardLocale');
	dashboardObj.url = req.get('host');
	getTableData(req.query.roleId, req.token, req.query.campaignId, req.query.nextIndex).then(function (data) {
		var args = {
			partials : pages.hiring,
			roles: data.surveyInfo.survey_entry.radio_panel,
			applicants : data.allApplicants.applicants,
			nextIndex:data.allApplicants.next_index,
			surveyType: req.query.surveyType,
			dashboardObj:dashboardObj.dashboardObj()
		};
		htmlResponse(req, res, pages.hiring, args);
	}, function(err) {
		console.log(err);
	});
});

app.get('/get-table-onscroll-content',function(req, res){

	getTableData(req.query.roleId, req.token, req.query.campaignId, req.query.nextIndex).then(function (data) {
		var args = {
			roles: data.surveyInfo.survey_entry.radio_panel,
			applicants : data.allApplicants.applicants,
			nextIndex:data.allApplicants.next_index,
			surveyType: req.query.surveyType,
		};
		res.render(pages.hiring.tableContent, args);

	}, function(err) {
		console.log(err);
	});

})

app.get('/change-applicants-status', function(req, res) {
	var campaignId = req.query.campaignId;
	api.post('/survey/'+campaignId+'/participants/update' , {
		json : {
			participants : req.query.batchArry
		},
		token : req.token
	}).then(function(data) {
		res.send(data);
	}, function(err) {
		res.send(400).send({
			msg : 'failed'
		});
	});
});

app.post('/create-a-job', function(req, res) {
	var campaignId = req.body.campaignId;
 	api.post('/survey/'+ campaignId+ '/profiles', {
		json : {
			name : req.body.jobTitle,
			description : req.body.jobDesc
		},
		token : req.token
	}).then(function(data) {
		res.send(data);
	}, function(err) {
		res.send(400).send({
			msg : 'failed'
		});
	});
});

app.post('/add-questions', function(req, res) {
	api.post('/survey/'+ req.body.campaignId + '/profiles/' + req.body.profileId + '/questions', {
		json : {
			question_body : req.body.question,
			live_time: 20
		},
		token : req.token
	}).then(function(data) {
		res.send(data);
	}, function(err) {
		res.send(400).send({msg : 'failed'});
	});
});

app.post('/create-campaign', function(req, res) {
	
	api.post('/survey', {
		json : {
			title : req.body.companyName,
			description : req.body.companyDesc,
			survey_type: req.body.surveyType,
		},
		token : req.token
	}).then(function(data) {
		res.send(data);
	}, function(err) {
		res.send(400).send({msg : 'failed'});
	});
});

app.get('/get-video-answers', function (req, res) {	
	api.get('/survey/' +req.query.surveyId + '/profiles/' + req.query.profileId + 
		'/participants/' + req.query.participantId, {
		token: req.token
	}).then(function (data) {
		args = {
			applicantData : data
		}
		res.render(pages.hiring.videoAnswersModal, args);
	}, function (err) {
			res.send(400).send({
			msg : 'failed'
		});
	});
});

app.get('/edit-profile', function (req, res) {
	var url = '/survey/' +req.query.campaignId + '/profiles/' + req.query.profileId;
	//console.log(url);
	api.get(url , {
		token: req.token
	}).then(function (data) {
			//console.log(data);
			res.send(data);
	}, function (err) {
			res.send(400).send({msg : 'failed'});
	});
});

app.post('/delete-profile', function (req, res) {
	var url = '/survey/' +req.body.campaignId + '/profiles/' + req.body.profileId;
	api.post(url, {
		json : {
			deleted: true
		},
		token: req.token
	}).then(function (data) {
			console.log(data);
			res.send(data);
	}, function (err) {
			res.send(400).send({msg : 'failed'});
	});
});

app.post('/update-profile', function (req, res) {
	var url = '/survey/' +req.body.campaignId + '/profiles/' + req.body.roleId;
	api.post( url, {
		json : {
			name : req.body.roleName,
			description: req.body.roleDesc,
		},
		token:req.token
	}).then(function (data) {
		res.send(data);
	},
	function (err) {
		console.log(err);
	})
});

app.get('/edit-questions', function (req, res) {
	var url = '/survey/' +req.query.campaignId + '/profiles/' + req.query.roleId + '/questions';
	api.get( url, {
		token: req.token
	}).then(function (data) {
		res.send(data.stream);
	}, function (data) {
		console.log(err);
	});
});

app.post('/delete-question', function (req, res) {
	var url = '/survey/' +req.body.campaignId + '/profiles/' + req.body.roleId + '/questions/' + req.body.questionId;
	api.post( url, {
		json: {
			deleted: true
		},
		token: req.token
	}).then(function (data) {
		res.send(data);
	},
	function (err) {
		console.log(err);
	});
});

app.get('/sort-table', function (req, res) {
	var url = ''
	api.get(url , {
		qs : {
			field: req.query.field,
			sortOrder: req.order.sortOrder
		},
		token: req.token
	}).then(function (data) {
		console.log(data);
		//res.render()
	}, function (err) {

	});
});

app.get('/search-table', function (req, res) {
	var url = ''
	api.get(url , {
		qs : {
			searchString: req.query.searchString
		},
		token: req.token
	}).then(function (data) {
		console.log(data);
		//res.render()
	}, function (err) {

	});
});

app.get('/delete-campaign', function (req, res) {
	api.post('/survey/'+req.query.campainId , {
		json: {
			deleted: true
		},
		token: req.token
	}).then(function (data) {
		res.send(data);
	}, function (err) {

	});
});

app.get('/update-compaign', function (req, res) {
	api.post('/survey/'+req.query.campainId , {
		json: {
			title:req.query.campaignTitle,
			description:req.query.campaignDesc
		},
		token: req.token
	}).then(function (data) {
		res.send(data);
	}, function (err) {

	});
});

app.post('/edit-compaign', function (req, res) {
	
	api.get('/survey/' + req.body.campainId, {
    token: req.token
	  }).then(function(data){
	  	res.send(data);
	})
});

app.post('/upload-logo', function (req, res) {

	//console.log(req.files.image,req.body)

	api.post('/user/update_profile/'+req.body.userId, {
		formData: {
      profile_picture: fs.createReadStream(config.app.uploadsDir + '/' + req.files.image.name)
    },
		token: req.token
	}).then(function (data) {
		//console.log(data)
		res.send(data);
	}, function (err) {
		console.log(err)

	});
});