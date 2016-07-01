var modelBuilder = require('./modelBuilder');

var Notification = modelBuilder(
  'Notification',
  ['id', 'text', 'link', 'icon', 'seen', 'time']
);

var User = modelBuilder(
  'User',
  ['id', 'username', 'name', 'token',
   'is_celebrity','to_invite','twitter_handle','twitter_text', 'title', 'bio', 'views', 'followers', 'following',
   'intro_video_url','promo_video_url', 'dash_video_url', 'thumbnail_url', 'profile_photo_url',
   'is_following', 'is_follower','answer_count','facebook_write_permission','twitter_write_permission','youtube_write_permission']
);

var Question = modelBuilder(
  'Question',
  ['id', 'slug', 'body', 'is_anonymous', 'timestamp', 'upvotes', 'to', 'from',
   'is_voted', 'short_id', 'is_answered', 'is_open','answer_count','banner_url', 'description','answers']
);

var Answer = modelBuilder(
  'Answer',
  ['id', 'question', 'video_url', 'promo_video_url', 'dash_video_url', 'thumbnail_url', 'views',
   'num_comments', 'num_likes', 'num_shares', 'facebook_shares', 'twitter_shares', 'other_shares', 'author', 'asker', 'comments', 'is_liked', 'short_id'],
  function () { return {comments: []}; }
);

var Comment = modelBuilder(
  'Comment',
  ['id', 'body', 'timestamp', 'author','authorUsername']
);
var Video = modelBuilder(
  'Video',
    ['id', 'body', 'timestamp', 'question_author','answer_author','video_url', 'thumbnail_url']
);

var Category = modelBuilder(
  'Category',
  ['id', 'slug', 'name', 'banner_url', 'icon_url']
);

var hiring = {
  Applicant: modelBuilder(
    'Applicant',
    ['id', 'name', 'username', 'position', 'age', 'experience', 'college', 'date', 'profile_id',
     'email', 'gender', 'status', 'answer_status', 'answers_links', 'current_employer', 'posts',
     'contact','phone_num','current_city','native_city'],
    function () { return {answers_links: []};}
  ),

  Role: modelBuilder(
    'Role',
    ['id', 'name', 'slug']
  )
};


var Survey = modelBuilder(
  'Survey',
  ['id', 'title', 'desc', 'type']
);
var userType = modelBuilder(
  'userType',
  ['stream']
  )
var Post = modelBuilder(
  'Post',
  ['id', 'web_link', 'author']
);

var karaokeCategory = modelBuilder(
  'karaokeCategory',
  ['id', 'icon_url', 'name', 'display_name', 'score']
);

var karaokeTrack = modelBuilder(
  'karaokeTrack',
  ['id', 'icon_url', 'name', 'display_name', 'score', 'url']
);
module.exports = {
  User: User,
  Question: Question,
  Answer: Answer,
  Comment: Comment,
  Category: Category,
  hiring: hiring,
  Survey: Survey,
  userType:userType,
  Notification: Notification,
  Post: Post,
  Video: Video,
  karaokeCategory: karaokeCategory,
  karaokeTrack: karaokeTrack
};