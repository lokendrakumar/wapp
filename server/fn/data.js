var Promise = require('bluebird');
var _ = require('lodash');

var api = require('api');

var data = module.exports = {

  /**
   * get a promise for list of all top-level categories
   */
  getCategories: function (token, widget) {
    return api.get('/list/items', {
      token: token,
      widget: widget
    });
  },

  /**
   * get a promise for currently logged in user
   */
  getMe: function (token, widget) {
    return api.get('/user/profile/me', {
      token: token,
      widget: widget
    });
  },

  /**
   * get feed for currently logged in user
   */
  getMyFeed: function (offset, token) {
    var batchSize = 10;
    return api.get('/timeline/homenew', {
      token: token,
      qs: {
        offset: offset,
        limit: batchSize
      }
    });
  },

  /**
   * get a user's profile by username
   */
  getUser: function (username, token, widget) {
    return api.get('/user/profile/' + username, {
      token: token,
      widget: widget
    });
  },

  /**
   * get a promise for a user's feed
   */
  getUserFeed: function (user, pageNum, token, widget) {
    var batchSize = 12;
    var offset = pageNum;
    return api.get('/timeline/user/' + user.id + '/multitype', {
      qs: {
        offset: offset,
        limit: batchSize,
        include_questions: 1
      },
      token: token,
      widget: widget
    });
  },

  /**
   * get open questions
   */
  getOpenQuestions: function (user, pageNum, token, widget) {
    var batchSize = 12;
    var offset = pageNum;

    var qs = {
      offset: offset,
      limit: batchSize
    };

    if (user) {
      qs.user_id = user.id;
    }
    return api.get('/question/list/open', {
      qs: qs, //,
      // token: token
      widget: widget
    });
  },

  /**
   * get answers to open question
   */
  getOpenAnswers: function (question, offset, token, widget, batchSize) {
    batchSize === undefined ? 10 : batchSize;
    var qs = {
      offset: offset,
      limit: batchSize
    };
    qs.question_id = question;

    return api.get('/question/list/answers', {
      qs: qs,
      token: token,
      widget: widget
    })
  },
  /**
   * get a promise for a user's answers
   */
  getUserAnswers: function (user, pageNum, token, widget) {
    var batchSize = 4;
    var offset = (pageNum - 1) * batchSize;
    offset = pageNum;
    return api.get('/timeline/user/' + user.id + '/multitype', {
      qs: {
        offset: offset,
        limit: batchSize,
        include_questions: 0
      },
      token: token,
      widget: widget
    });
  },

  getUserQuestion: function (user, offset, widget, author) {
    var batchSize = 4;
    return api.get('/question/list/public/' + user.id, {
      qs: {
        limit: batchSize,
        since: offset,
        question_authors: [author]
      },
      widget: widget,
    });
  },

  /**
   * get a promise for a category's feed
   */
  getCategoryFeed: function (category, offset, token, widget) {
    var batchSize = 12;
    return api.get('/list/feed', {
      qs: {
        list_id: category.id,
        offset: offset,
        limit: batchSize,
      },
      widget: widget
    });
  },

  /**
   * get category users
   */
  getCategoryUsers: function (category, offset, token, widget) {
    var batchSize = 12;
    return api.get('/list/featured/users', {
      qs: {
        list_id: category.id,
        offset: offset,
        limit: batchSize
      },
      token: token,
      widget: widget
    });
  },

  /**
   * get feedItem(q or a) by a particular user via question slug
   */
  getFeedPost: function (user, questionSlug, token, widget) {
    return api.get('/slug/' + user.username + '/' + questionSlug, {
      token: token,
      widget: widget
    });
  },

  /**
   * get feedItem(q or a) by a question id
   */
  getQuestion: function (questionId, token, widget) {
    return api.get('/question/view/' + questionId, {
      token: token,
      widget: widget
    });
  },

  /**
   * get feedItem(q or a) by a postId
   */
  getPostById: function (postShortId, token, widget) {
    return api.get('/post/view/' + postShortId, {
      token: token,
      widget: widget
    });
  },

  /**
   * get Filtered discover feed
   */
   getDiscoverFilteredFeed: function (offset, useroffset, token, categoryName, widget) {
       var offset = offset;
       var limit = 9;
           if(offset >0 && useroffset >0){
             return Promise.props({
             featuredFeed: api.get('/list/feed',{
               qs: {
                 offset: offset,
                 limit: limit,
                 filter:categoryName
               },
               widget: widget,
               token: token
             }),
             moreUser:api.get('/list/'+categoryName+'/users',{
               qs: {
                 offset: useroffset,
                 limit: 3,
               },
               widget: widget,
               token: token
             })
           });
         }
         else if(offset < 0){
           return Promise.props({
             moreUser:api.get('/list/'+categoryName+'/users',{
               qs: {
                 offset: useroffset,
                 limit: 3,
               },
               widget: widget,
               token: token
             }),
             featuredFeed :undefined
           })
         }
         else {
            return Promise.props({
             featuredFeed: api.get('/list/feed',{
               qs: {
                 offset: offset,
                 limit: limit,
                 filter:categoryName
               },
               widget: widget
             }),
            });
         }
     },

    /**
   * get discover feed
   */
  getDiscoverFeed: function (pageNum, token, widget) {
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
        qs: {
          offset: offset.trendingQuestions,
          limit: batch.trendingQuestions
        },
        token: token,
        widget: widget
      }),
      popularAnswers: api.get('/list/trending/posts', {
        qs: {
          offset: offset.popularAnswers,
          limit: batch.popularAnswers
        },
        token: token,
        widget: widget
      }),
      featuredAnswers: api.get('/list/featured/posts', {
        qs: {
          offset: offset.featuredAnswers,
          limit: batch.featuredAnswers
        },
        token: token,
        widget: widget
      }),
      featuredUsers: api.get('/list/featured/users', {
        qs: {
          offset: offset.featuredUsers,
          limit: batch.featuredUsers
        },
        token: token,
        widget: widget
      }),
      trendingAnswers: api.get('/list/trending/posts', {
        qs: {
          offset: offset.trendingAnswers,
          limit: batch.trendingAnswers
        },
        token: token,
        widget: widget
      }),
      popularQuestions: api.get('/list/featured/questions', {
        qs: {
          offset: offset.popularQuestions,
          limit: batch.popularQuestions
        },
        token: token,
        widget: widget
      })
    });
  },
  getSurveyAllData: function (token, surveyId) {
    if (!surveyId) {
      return Promise.props({
        surveyInfo: 'login',
        allApplicants: 'login',
        surveyList: api.get('/survey', {
          token: token
        })
      });
    } else {
      return Promise.props({

        surveyInfo: api.get('/survey/' + surveyId, {
          qs: {
          offset: 0,
          limit: 20
        },
          token: token
        }),
        allApplicants: api.get('/survey/' + surveyId + '/participants', {
          qs: {
          offset: 0,
          limit: 20
        },
          token: token
        }),
        surveyList: api.get('/survey', {
          token: token
        })
      });
    }
  },

  getTableData: function (roleId, token, surveyId, nextIndex) {
    // console.log(nextIndex)
    var offset, limit;
    if(nextIndex){
      offset = nextIndex;
      limit = 10;
    }
    else{
      offset = 0;
      limit = 20;
    }
    //console.log(offset,limit)

    if (roleId) {
      return Promise.props({
        surveyInfo: api.get('/survey/' + surveyId, {
          qs: {
          offset: 0,
          limit: 20
        },
          token: token
        }),
        allApplicants: api.get('/survey/' + surveyId + '/profiles/' + roleId + '/participants', {
          qs: {
          offset: offset,
          limit: limit
        },
          token: token
        })
      });
    } else {
      return Promise.props({
        surveyInfo: api.get('/survey/' + surveyId, {
          qs: {
          offset: 0,
          limit: 20
        },
          token: token
        }),
        allApplicants: api.get('/survey/' + surveyId + '/participants', {
          qs: {
          offset: offset,
          limit: limit
        },
          token: token
        })
      });
    }
  },

  /**
   * get featured content
   */
  getFeatured: function (listId, type, limit, offset, token, widget) {
    var qs = {
      limit: limit,
      offset: offset
    };

    if (listId !== null || listId !== undefined) {
      qs.list_id = listId;
    }

    return api.get('/list/featured/' + type, {
      qs: qs,
      token: token,
      widget: widget
    });
  },

  /**
   * get popular content
   */
  getTrending: function (listId, type, limit, offset, token, widget) {
    var qs = {
      limit: limit,
      offset: offset
    };

    if (listId !== null || listId !== undefined) {
      qs.list_id = listId;
    }

    return api.get('/list/trending/' + type, {
      qs: qs,
      token: token,
      widget: widget
    });
  },

  /**
   * get comments
   */
  getComments: function (answerId, pageNum, token, widget) {
    var batch = 10;
    var offset = (pageNum - 1) * batch;

    return api.get('/comment/list', {
      qs: {
        post_id: answerId,
        limit: batch,
        since: offset
      },
      token: token,
      widget: widget
    });
  },

  /**
   * add new comments
   */
  addComment: function (answerId, body, token, widget) {
    return api.post('/comment/add', {
      json: {
        post_id: answerId,
        body: body
      },
      token: token,
      widget: widget
    });
  },

  /**
   * validate the token in reset password link
   * @param token
   * @returns {token}
   */
  validatePasswordResetToken: function (token, widget) {
    return api.post('/forgotpassword/check_token', {
      json: {

        token: token
      },
      widget: widget
    });
  },

  getUserType: function (userId, token) {
    return api.get('/video/end_links/user/' + userId , {
      token: token
    });
  },
  getBlog : function (userId, nextIndex) {
    var qs = {
      offset: nextIndex,
      limit: 10,
      filter: 'blog',
      user_id: userId
    };

    return api.get('/user/posts',{
      qs: qs
    });
  },



  getProfileFeed: function(user, offset, token, reqparam, widget){
    if(reqparam ==='All' || reqparam === undefined){
      var batchSize = 12;
      return api.get('/timeline/user/' + user.id + '/multitype', {
        qs: {
          offset: offset,
          limit: batchSize,
          include_questions: 1
        },
        token: token,
        widget: widget
      });
    }
    else if(reqparam === 'Post'){
      var batchSize = 12;
      return api.get('/timeline/user/' + user.id + '/multitype', {
        qs: {
          offset: offset,
          limit: batchSize,
          include_questions: 0
        },
        token: token,
        widget: widget
      });
    }
    else{
      var batchSize = 10;
      return api.get('/question/list/public/' + user.id, {
        qs: {
          limit: batchSize,
          since: offset
        },
        token: token,
        widget: widget
      });
    }
  },

  getSearchData: function(querystring, offset, token){
    var batchSize = 10;
    return api.get('/search?q='+querystring+'&limit='+batchSize+'&offset='+offset, {
      token: token
    });
  },

  getNotificationData: function(token, offset, type){
    var batchSize = 10;
    return api.get('/getnotifications?limit='+batchSize+'&offset='+offset+'&type='+type, {
      token:token
    });
  },


/*getting survey by survey id without authentication
*/
    getSurvey: function (surveyId) {
    return api.get('/survey/' + surveyId);
  },

  getVideoComments: function(sourceUrl, offset, limit){
    var limit = (typeof limit == 'undefined') ? 4 : limit;
    var offset = (typeof offset == 'undefined') ? 0 : offset;
    return api.get('/post/get?page_url=' + sourceUrl + '&filter_type=post&offset='+ offset +'&limit='+ limit);
  }
};
