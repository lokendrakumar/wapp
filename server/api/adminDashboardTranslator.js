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
    author: data.comment_author, // should be an instance of user
    authorUsername: data.comment_author.username
  });
};

var postBuilder = function (data) {
  return models.Post({
    id: data.id,
    web_link: data.web_link,
    author: data.answer_author.username // should be an instance of user
  });
};

var videoBuilder = function (data) {

  return models.Video({
    id: data.id,
    body: data.question.body,
    timestamp:data.answer.timestamp,
    question_author: data.question_author.username, 
    answer_author: data.answer_author.username,
    video_url:data.answer.media_urls,
    thumbnail_url: data.answer.media.thumbnail_url
  });
};

var categoryBuilder = function (data) {
 
  return models.Category({
    id: data.list.id,
    slug: data.list.name,
    name: data.list.display_name,
    banner_url: data.list.banner_image,
    icon_url: data.list.icon_image
  });
};
var karaokeCategoryBuilder = function (data) {
  return models.karaokeCategory({
    id: data.id,
    display_name: data.display_name,
    icon_url: data.icon_image,
    name: data.name,
    score: data.score
  });
};

var karaokeTrackBuilder = function (data) {
  return models.karaokeTrack({
    id: data.id,
    display_name: data.display_name,
    icon_url: data.icon_image,
    name: data.name,
    score: data.score,
    url: data.url
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
    method: 'GET',
    pattern: /^(\/admin\/comment\/list|\/admin\/dirty_comments\/get)$/i,
    translate: function (data) {
      //console.log(data,'translate');
      return {
        comments: data.comments.map(function (comment){
                return{
                  comment: commentBuilder(comment),
                  post: postBuilder(comment.on_post)
                }
              })
      }; 
    }
  },
  {
    method: 'GET',
    pattern: /^(\/admin\/user\/posts)$/i,
    translate: function (data) {
      //console.log(JSON.stringify(data),'translate');
      return {
        count: data.count,
        next_index: data.next_index,
        videos: data.posts.map(function (video){
                return {
                 video: videoBuilder(video)
                }
              })
      };
      
    }
  },
  {
    method: 'GET',
    pattern: /^(\/admin\/question\/list)$/i,
    translate: function (data) {
      //console.log(JSON.stringify(data),'translate');
      
      return {
        questions: data.questions.map(function (question){
              //console.log(question);
              if (!question.open_question) {
                question.to = question.question_to;
              } 
              question.from = question.question_author;
                

              return {
                question: questionBuilder(question)
              }
        })
      };
      
    }
  },
  {
    method: 'GET',
    pattern: /^(\/admin\/openquestions)$/i,
    translate: function (data) {
      //console.log(JSON.stringify(data),'translate');
      
      return {
        questions: data.open_questions.map(function (question){
              //console.log(question);
              // if (!question.open_question || 0) {
              //   question.to = question.question_to;
              // } 
              question.from = question.question_author;
                

              return {
                question: questionBuilder(question)
              }
        })
      };
      
    }
  },
  {
    method: 'GET',
    pattern: /^(\/dubs\/audiocategories\/[^\/]+)$/i,
    translate: function (data) {
      //return data;
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.stream.map(function (category){ 
              return {
                type:'audio_track',
                track: karaokeTrackBuilder(category.audio_track)
              };
        })
      };
    }
  },
  {
    method: 'GET',
    pattern: /^(\/dubs\/audiocategories)$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.stream.map(function (category){ 
              return {
                type:'audio_category',
                category: karaokeCategoryBuilder(category.audio_category)
              };
        })
      };
      
    }
  },
  {
    method: 'GET',
    pattern: /^(\/admin\/karaoke\/categories)$/i,
    translate: function (data) {
      return {
        count: data.count,
        next_index: data.next_index,
        items: data.stream.map(function (category){ 
              return {
                type:'karaoke_category',
                category: karaokeCategoryBuilder(category.karaoke_category)
              };
        })
      };
      
    }
  },

  {
    method: 'GET',
    pattern: /^(\/admin\/search\/video_feature)$/i,
    translate: function (data) {

      return {
        count: data.count,
        next_index: data.next_index,
        items: data.stream.map(function (category){ 
              if (category.type === 'audio_track') {
                return {
                  id: category.audio_track.id,
                  name: category.audio_track.display_name,
                  url: category.audio_track.url
                };
              } else if (category.type === 'karaoke_track') {
                return {
                  id: category.karaoke_track.id,
                  name: category.karaoke_track.display_name,
                  url: category.karaoke_track.voice_url
                }
                  
              }
        })
      };
    }
  },


  {
    method: 'GET',
    pattern: /^(\/admin\/karaoke\/categories\/[^\/]+\/items)$/i,
    translate: function (data) {
      //return data;
      return {
        count: data.count,
        next_index: data.next_index,
        category_id: data.category_id,
        items: data.stream.map(function (category){ 
              return {
                type:'karaoke_track',
                track: karaokeTrackBuilder(category.karaoke_track)
              };
        })
      };
      
    }
  }
];