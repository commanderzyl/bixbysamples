var newsApiLib = require('../lib/newsAPI.js');

module.exports.function = function RefreshNews(newsInfo){
  var newsInfo = newsApiLib.refreshMoreNews(newsInfo);
  return newsInfo;
}


