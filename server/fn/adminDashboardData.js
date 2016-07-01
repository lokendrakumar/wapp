var Promise = require('bluebird');
var _ = require('lodash');
var api = require('api');
var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';

var adminData = module.exports = {

  /**
   * get a promise for list of all Moderation question
   */
  getModerationQuestion : function (offset, flag, boolflag) {
    var batchSize = 12;
    // var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    var args =       {
        token: token,
        qs : {
        limit: batchSize,
        offset: offset,
        public: 1,
      }
    };
    if (typeof flag !== 'undefined' && flag !== null && flag !== ''){
      args.qs.flag = flag;
    }
    
    return api.get('/admin/question/list', args);
  },
  getOpenquestion : function (offset) {
    var batchSize = 12;
    var args =       {
        token: token,
        qs : {
        limit: batchSize,
        offset: offset
      }
    };
    return api.get('/admin/openquestions', args);
  },

  getComments : function (offset, param) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    if (param == 'dirty'){
      return api.get('/admin/dirty_comments/get',
        {
          token: token,
          qs : {
          limit: batchSize,
          offset: offset,
        }
      });
    } else{
      return api.get('/admin/comment/list',
        {
          token: token,
          qs : {
          limit: batchSize,
          offset: offset,
          public: 1
        }
      });
    }
  },
  getVideos :function(offset, param) {
    var batchSize = 10;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
      return api.get('/admin/user/posts',
        {
          token: token,
          qs : {
          limit: batchSize,
          offset: offset,
          post_type:'flagged',
          sort_by :param
        }
      });
  },
  getDubsmashCat :function(offset) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.get('/dubs/audiocategories',
      {
        token: token,
        qs : {
        limit: batchSize,
        offset: offset,
      }
    });
  },

  getDubsmashCatAudio :function(catId, offset) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.get('/dubs/audiocategories/'+ catId,
      {
        token: token,
        qs : {
        limit: batchSize,
        offset: offset,
      }
    });
  },

  deleteDubsmashCatAudio :function(audioId, catId) {
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.post('/admin/audioitems/update/'+ audioId,
      {
        token: token,
        formData : {
          parent_category_id: catId,
          deleted: 1
      }
    });
  },

  getCategories :function(offset, param) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.get('/admin/karaoke/categories',
    {
        token: token,
    });
  },

  getTracks :function(offset, id) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.get('/admin/karaoke/categories/'+id+'/items',
    {
        token: token,
    });
  },

  getSearch: function(string, feature, offset) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.get('/admin/search/video_feature', {
      token: token,
      qs: {
        query: string,
        video_feature: feature,
        limit:batchSize,
        offset: offset
      }
    });
  },

  deleteTracks :function(offset, id, categoryId) {
    var batchSize = 12;
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    return api.delete('/admin/karaoke/categories/'+categoryId+'/tracks/'+id,
    {
        token: token
    });
  },

  postReorder: function (feature, reorderType, item_id, next_item_id, previous_item_id) {
    var token = '3a6472916a9c8d1ce5b867d7ba7a585d390fcc7d';
    var args =     {
        token: token,
        json: {
          item_id: item_id,
          next_item_id: next_item_id,
          previous_item_id: previous_item_id
        }
    };
    console.log(args);
    return api.post('/admin/reorder/' + feature+ '/'+ reorderType, args);
  }
};