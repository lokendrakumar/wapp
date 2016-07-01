var getCategories = require('fn').data.getCategories;

var topLevelCategorySlugs = [
  'tv',
  'entertainment',
  'food-health',
  'books-literature',
  'startups-business',
  'sports',
  'fashion-lifestyle',
  'music',
  'comedy-humour',
  'politics'
];

var loaded = true;
var list = [];
var listAll = [];

var load = function (callback) {
  if (loaded) {
    callback(null, list);
  } else {
    getCategories().then(
      function (data) {
        topLevelCategorySlugs.forEach(function (slug) {
          list.push(data.list.filter(function (cat) {
            return cat.slug === slug;
          })[0]);
        });

        listAll = data.list;
        loaded = true;
        callback(null, list);
      },
      function (res) {
        callback(res, null);
      }
    );
  }
};

module.exports = {
  load: load,
  list: function () {
    return list;
  },
  listAll: function () {
    return listAll;
  },
};