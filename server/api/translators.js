var _ = require('lodash');
var models = require('./models');


var videoUrl = function (videos, promo, dash) {
  if (promo === true && videos['promo']) return videos['promo'];
  if (dash === true && videos['dash']) return videos['dash'];
  if (videos['200']) return videos['200'];
  if (videos['400']) return videos['400'];
  if (videos['900']) return videos['900'];
  if (videos['original']) return videos['original'];

};

var userBuilder = function (data, token) {
  return models.User({
    id: data.id,
    token: token ? token : null,
    username: data.username,
    is_celebrity: parseInt(data.user_type) === 2,
    to_invite: parseInt(data.user_type) === 1,
    twitter_handle: data.twitter_handle ? data.twitter_handle : null,
    twitter_text: data.twitter_invite_text,
    title: data.user_title,
    name: data.first_name,
    bio: data.bio,
    views: data.view_count,
    is_following: data.is_following,
    is_follower: data.is_follower,
    followers: data.follower_count,
    following: data.following_count,
    intro_video_url: data.profile_videos ? videoUrl(data.profile_videos) : null,
    promo_video_url: data.profile_videos ? videoUrl(data.profile_videos, true, false) : null,
    dash_video_url: data.profile_videos ? videoUrl(data.profile_videos, false, true) : null,
    thumbnail_url: data.profile_videos ? data.profile_videos.thumb : null,
    profile_photo_url: data.profile_picture,
    answer_count: parseInt(data.answer_count),
    twitter_write_permission: data.twitter_write_permission,
    facebook_write_permission: data.facebook_write_permission,
    youtube_write_permission: data.youtube_write_permission
  });
};

var questionBuilder = function (data) {
  var dataTo = (data.to == undefined && typeof data.question_to !== undefined) ? data.question_to : data.to;
  var dataFrom = (data.from == undefined && typeof data.question_author !== undefined) ? data.question_author : data.from;
  var open = (data.open_question === true && data.posts) ? true : false;
  return models.Question({
    id: data.id,
    description: data.description,
    slug: data.slug,
    body: data.body,
    is_anonymous: data.is_anonymous,
    timestamp: data.timestamp,
    upvotes: data.ask_count,
    to: dataTo, // should be instance of user
    from: dataFrom, // should be instance of user\
    is_voted: data.is_voted,
    short_id: data.short_id,
    is_answered: data.is_answered,
    is_open: data.open_question,
    answer_count: parseInt(data.answer_count),
    banner_url: data.banner_image ? data.banner_image : null,
    answers: open ? data.posts.stream
                              .filter(function (item) {
                                return ['post'].indexOf(item.type) > -1;
                              })
                              .map(function (i){
                                return answerBuilder(i.post);}) : null
                              });
};

var notificationBuilder = function (data){
  var formattedTime = '';
  var date = new Date(data.timestamp*1000);
  var diff = (((new Date()).getTime() - date) / 1000)
    , day_diff = Math.floor(diff / 86400);

    formattedTime = day_diff == 0 && (
      diff < 60 && "just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
      day_diff == 1 && "Yesterday" ||
      day_diff < 7 && day_diff + " days ago" ||
      Math.ceil( day_diff / 7 ) + " weeks ago";
  // console.log("not",data);
  return models.Notification({
    id: data.id,
    text: data.text,
    seen: data.seen,
    link: data.link,
    time: formattedTime,
    icon: data.icon_url
  });
};

var answerBuilder = function (data) {
  var answer = models.Answer({
    id: data.id,
    question: data.question, // should be instance of question
    video_url: data.answer && data.answer.media_urls ? videoUrl(data.answer.media_urls) : null,
    promo_video_url: data.answer && data.answer.media_urls ? videoUrl(data.answer.media_urls, true, false) : null,
    dash_video_url: data.answer && data.answer.media_urls ? videoUrl(data.answer.media_urls, false, true) : null,
    thumbnail_url: data.answer && data.answer.media_urls ? data.answer.media_urls.thumb : null,
    views: data.view_count,
    num_comments: data.comment_count,
    num_likes: data.liked_count,
    num_shares: data.all_share_count, // there also exists a whatsapp share count
    facebook_shares: data.facebook_share_count, // there also exists a whatsapp share count
    twitter_shares: data.twitter_share_count, // there also exists a whatsapp share count
    other_shares: data.other_share_count, // there also exists a whatsapp share count
    author: data.answer_author, // should be an instance of user
    asker: data.question_author, // should be an instance of user
    is_liked: data.is_liked,
    short_id: data.client_id
  });

  if (!_.isUndefined(data.comments)) {
    answer.comments = {
      list: data.comments && data.comments.comments.map(commentBuilder),
      next_index: data.comments.next_index,
      post_id: data.comments.post
    };
  } else {
    answer.comments = {
      list: [],
      next_index: null,
      post_id: null
    };
  }

  return answer;
};

var commentBuilder = function (data) {
  return models.Comment({
    id: data.id,
    body: data.body,
    timestamp: data.timestamp,
    author: data.comment_author // should be an instance of user
  });
};

var categoryBuilder = function (data) {
  // console.log("HereS", data);
  return models.Category({
    id: data.list.id,
    slug: data.list.name,
    name: data.list.display_name,
    banner_url: data.list.banner_image,
    icon_url: data.list.icon_image
  });
};

var hiring = {
  applicantBuilder: function (data) {
    var applicant = models.hiring.Applicant({
      id: data.survey_participant.id,
      profile_id: data.survey_participant.profile_id,
      name: [data.survey_participant.first_name, data.survey_participant.last_name].join(' '),
      username: data.survey_participant.username,
      age: data.survey_participant.age,
      status: data.survey_participant.status,
      answer_status: data.survey_participant.answer_status,
      gender: data.survey_participant.gender,
      current_employer: data.survey_participant.current_employer,
      experience: data.survey_participant.experience,
      college: data.survey_participant.college,
      email: data.survey_participant.email,
      position: data.survey_participant.profile.display_name,
      date: (new Date(data.survey_participant.applied_on)).toDateString(),
      answer_status: data.survey_participant.is_answered,
      posts: data.survey_participant.posts ? data.survey_participant.posts : null,
      phone_num: data.survey_participant.phone_num
    });
    return applicant;
  },

  roleBuilder: function (data) {
    return models.hiring.Role({
      id: data.id,
      name: data.name,
      slug: data.slug
    });
  }
};

var survey = function (data) {
  return models.Survey({
    id: data.survey_entry.id,
    title: data.survey_entry.title,
    desc: data.survey_entry.description,
    type: data.survey_entry.survey_type
  });
};

var userType = function (data) {
  return models.userType({
    data: data.stream
  });
};

module.exports = [
  {
    method: 'POST',
    pattern: /^(\/login\/email|\/reg\/email|\/login\/social\/[^\/]+)$/i,
    translate: function (data) {
      return {
        user: userBuilder(data.user, data.access_token)
      };
    }
  },
  {
      method:'POST',
      pattern: /^(\/question\/ask|\/openquestion\/ask)+/i,
      translate: function (data){
        return {
          question: questionBuilder(data.question)
        }
      }
  },
  {
    method: 'GET',
    pattern: /^\/user\/profile\/(\w+|\/me)$/i,
    translate: function (data) {
      return {
        user: userBuilder(data.user)
      };
    }
  },
  {
    method: 'GET',
    pattern: /^(\/discover\/post\/multitype|\/timeline\/user\/[^\/]+\/multitype|\/list\/feed|\/list\/(featured|trending)\/(users|posts|questions)|\/timeline\/homenew|\/question\/list\/(open|answers))[^\/\s]*$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.stream
          .filter(function (item) {
            return ['post', 'user', 'question' ,'user_list'].indexOf(item.type) > -1;
          })
          .map(function (item) {

            if (item.type === 'post') {
              item.post.question = questionBuilder(item.post.question);
              item.post.answer_author = userBuilder(item.post.answer_author);
              item.post.question_author = userBuilder(item.post.question_author);
              return {
                type: 'answer',
                model: answerBuilder(item.post)
              };
            } else if (item.type === 'user') {

              return {
                type: 'user',
                model: userBuilder(item.user)
              };
            } else if (item.type === 'question') {
              if (!item.question.open_question) {
                item.question.to = userBuilder(item.question.question_to);

              }
              item.question.from = userBuilder(item.question.question_author);
              return {
                type: 'question',
                model: questionBuilder(item.question)
              };
            } else if(item.type === 'user_list') {

              var newUserArry =[];
              //var userArryLength = item.user_list.stream.length;
              var userArry = item.user_list.stream
              for(var i=0; i<3; i++) {
                if(userArry[i].type === 'user') {
                  var userObj = {
                    type: 'user',
                    model: userBuilder(userArry[i].user)
                  };
                  newUserArry[i] = userObj;
                }
              }
              return {
                count: 3,
                next_index: 3,
                type: 'user_list',
                user_list: newUserArry
              };
            }
          })
      };
    }

  },

  {
    method: 'GET',
    pattern: /^\/comment\/list[^\/\s]*/,
    translate: function (data) {
      return {
        post_id: data.id,
        next_index: data.next_index,
        list: data.comments.map(function (c) {
          c.comment_author = userBuilder(c.comment_author);
          return commentBuilder(c);
        })
      };
    },
  },
  {
    method: 'GET',
    pattern: /^\/slug\/[^\/]+\/[^\/]+$/i,
    translate: function (data) {
      if (data.is_answered) {
        data.post.question = questionBuilder(data.post.question);
        data.post.answer_author = userBuilder(data.post.answer_author);
        data.post.question_author = userBuilder(data.post.question_author);
        return {
          is_answered: data.is_answered,
          answer: answerBuilder(data.post)
        };
      } else {
        if (!data.question.open_question) {
          data.question.to = userBuilder(data.question.question_to);
        }
        data.question.from = userBuilder(data.question.question_author);
        return {
          is_answered: data.is_answered,
          question: questionBuilder(data.question)
        };
      }
    }
  },
  {
    method: 'GET',
    pattern: /^\/post\/get/i,
    translate: function (data) {
     return {
        count: data.count,
        next_index: data.next_index,
        model: data.stream.map(function (item) {
          //item.post.question = questionBuilder(item.post.question);
          item.post.answer_author = userBuilder(item.post.answer_author);
          //item.post.question_author = userBuilder(item.post.question_author);
          answerBuilder(item.post);
          return(item);
      })
    }
  }
},
  {
    method: 'GET',
    pattern: /^\/list\/items$/i,
    translate: function (data) {
      return {
        list: data.list_items.map(function (cat) {
          return categoryBuilder(cat);
        })
      };
    }
  },
  {
    method: 'GET',
    pattern: /^\/post\/view\/[^\/]+$/i,
    translate: function (data) {
      //if (data.type === 'post') {
      data.post.question = questionBuilder(data.post.question);
      data.post.answer_author = userBuilder(data.post.answer_author);
      data.post.question_author = userBuilder(data.post.question_author);
      return {
        is_answered: true,
        answer: answerBuilder(data.post)
      };
      //}
    }
  },
  {
    method: 'GET',
    pattern: /^\/question\/view\/[^\/]+$/i,
    translate: function (data) {
      var open = true;
      if (!data.question.open_question) {
        open = false
        data.question.to = userBuilder(data.question.question_to);
      }

      data.question.from = userBuilder(data.question.question_author);

      return {
        is_answered: false,
        question: questionBuilder(data.question)
      };
    }
  },
  {
    method: 'POST',
    pattern: /^\/question\/ask$/i,
    translate: function (data) {
      if (!data.question.open_question) {
        data.question.to = userBuilder(data.question.question_to);
      }
      data.question.from = userBuilder(data.question.question_author);
      return {
        is_answered: false,
        question: questionBuilder(data.question)
      };
    }
  },
  {
    method: 'POST',
    pattern: /^\/forgotpassword\/check_token$/i,
    translate: function (data) {
      return {
        user: userBuilder(data.user, data.token)
      }
    }
  },
  {
    method: 'GET',
    method: /^\/survey\/[^\/]+\/profiles$/i,
    taranlate: function (data) {
      return {
        roles: data.survey_entry.radio_panel.map(function (role) {
          return hiring.roleBuilder(role);
        })
      }
    }
  },
  {
    method: 'GET',
    pattern: /^\/survey\/[^\/]+\/profiles$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        roles: data.stream.map(function (role) {
          return hiring.roleBuilder(role);
        })
      }
    }
  },
  {
    method: 'GET',
    pattern: /^\/survey\/[^\/]+\/participants$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        applicants: data.stream.map(function (applicant) {
          return hiring.applicantBuilder(applicant);
        })
      };
    }
  },
  {
    method: 'GET',
    pattern: /^\/survey\/[^\/]+\/profiles\/[^\/]+\/participants$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        applicants: data.stream.map(function (applicant) {
          return hiring.applicantBuilder(applicant);
        }),
      }
    }
  },
  {
    method: 'GET',
    pattern: /^\/survey$/i,
    translate: function (data) {
      return {
        survey: data.stream.map(function (surveyObject) {
          return survey(surveyObject);
        })
      };
    }
  },
  {
    method: 'GET',
    pattern: /^\/video\/end_links\/user\/+[^\/]$/i,
    translate: function (data) {
      return {
        userType: data.stream.map(function (userTypeObject) {
          return userType(userTypeObject);
        })
      };
    }
  },
  {
    method: 'GET',
    pattern: /^\/question\/list\/public\/[^\/]+/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.questions.map(function (item) {
          if (item.type === 'question') {
            if (!item.question.open_question) {
              item.question.to = userBuilder(item.question.question_to);
            }
            item.question.from = userBuilder(item.question.question_author);
            return {
              type: 'question',
              model: questionBuilder(item.question)
            };
          }
        })
      }
    }
  },
  {
    method: 'GET',
    pattern: /\/user\/posts/i,
    translate: function(data){
      return{
        count: data.count,
        next_index: data.next_index,
        items: data.stream.map(function (item){
          return {
            type: 'blog',
            model: answerBuilder(item.post)

          };
        })
   }
  }
},
{
    method:'GET',
    pattern: /^\/search[^\/]+/i,
    translate: function (data){
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.results.map(function (item){
          if(item.type === 'user'){
            return {
              type : 'user',
              model : userBuilder(item.user)
            }
          }
        })
      }
    }
  },
  {
    method:'GET',
    pattern: /^\/getnotifications+/i,
    translate: function (data){
      return {
        count: data.count,
        next_index: data.next_index,
        results: data.notifications.map(function (item){
          return {
            notification : notificationBuilder(item)
          }
        })
      }
    }
  }


];
