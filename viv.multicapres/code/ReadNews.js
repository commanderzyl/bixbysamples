var newsApiLib = require('../lib/newsAPI.js');

module.exports.function = function readNews(newsInfo,newsTarget,searchOption){
  var newsInfo = newsApiLib.getReadNewsData(newsInfo,newsTarget,searchOption);
  return newsInfo;
}
