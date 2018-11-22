module.exports.function = function OpenNewsDetailLink (newsInfo) {
  var uri;
  var news = newsInfo.news[0];
  
  if (news != undefined && news != null) {
    uri = news.newsUrl;
  }
  console.log(uri)
  return {
    "uri": uri
  }
}
