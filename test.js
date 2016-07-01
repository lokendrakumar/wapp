var api = require('api');
var Promise = require('bluebird');

var api = require('api');
var Promise = require('bluebird');

var params = {};

var getDiscoverFeed = function (pageNum) {
  var batch = {
    trendingQuestions: 2,
    popularAnswers: 2,
    featuredAnswers: 2,
    featuredUsers: 4,
    trendingAnswers: 2,
    popularQuestions: 4
  };

  var offset = {};

  for (var k in batch) {
    offset[k] = (pageNum - 1) * batch[k];
  }

  return Promise.props({
    trendingQuestions: api.get('/list/trending/questions', {
      qs: {offset: offset.trendingQuestions, limit: batch.trendingQuestions}
    }),
    popularAnswers: api.get('/list/trending/posts', {
      qs: {offset: offset.popularAnswers, limit: batch.popularAnswers}
    }),
    featuredAnswers: api.get('/list/featured/posts', {
      qs: {offset: offset.featuredAnswers, limit: batch.featuredAnswers}
    }),
    featuredUsers: api.get('/list/featured/users', {
      qs: {offset: offset.featuredUsers, limit: batch.featuredUsers}
    }),
    trendingAnswers: api.get('/list/trending/posts', {
      qs: {offset: offset.trendingAnswers, limit: batch.trendingAnswers}
    }),
    popularQuestions: api.get('/list/featured/questions', {
      qs: {offset: offset.popularQuestions, limit: batch.popularQuestions}
    })
  });
};

getDiscoverFeed(1).then(function (data) {
  console.log(data.popularAnswers.items.map(function (i) { return i.model.question.body; }));
  console.log(data.featuredAnswers.items.map(function (i) { return i.model.question.body; }));  
});