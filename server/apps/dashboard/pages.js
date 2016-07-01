var view = require('view').prefix('dashboard');
var _ = require('lodash');

var common = {
	
	main : view('pages/std'),
	top : view('partials/top'),
	bottom : view('partials/bottom')
	
};

var pages = module.exports = {
	common : common,
	hiring : _.extend({}, common,{
		main : view('partials/main'),
		
		leftPane : view('partials/hiringLeftPane'),
		tableHeader :	view('partials/hiringTableHeader'),
		tableContent:view('partials/tableContent'),
		rightPane : view('partials/hiringRightPane'),
		createJobModal: view('partials/createJobCard'),
		videoAnswersModal: view('partials/videoAnswersModal'),
		editModals: view('partials/editModals'),
		campaignModal: view('partials/createCampaignModal'),
		editCampaignModal: view('partials/editCampaignModal'),
	})
};

