var baseLib = require('./base.js');

module.exports = {
  getViewNewsData:getViewNewsData,
  getPlayAudioNewsData:getPlayAudioNewsData,
  getReadNewsData:getReadNewsData,
  refreshMoreNews:refreshMoreNews
}

function getNews (newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,$vivContext) {
  var apiUrl = baseLib.BaseUrl.generateBaseUrl;
  var generateQueryUrl = new baseLib.generateQueryUrl();
  var timestamp = baseLib.getTimeStamp();
  var sign = baseLib.generateSign(newsCategory,dateTime,person,srcfrom,location,keywords,searchOption,$vivContext);
  generateQueryUrl.append("appid",config.get("news.appid"));
  generateQueryUrl.append("timestamp",timestamp);
  generateQueryUrl.append("sign",sign);

  var fullApiUrl = apiUrl + generateQueryUrl.getQuery();
  var query = baseLib.getArticalSearchBody(newsCategory,dateTime,person,srcfrom,location,keywords,searchOption,$vivContext);
  var options = {
    format: "json",
    headers: {
      "Content-Type":'application/json'
    }
  }

  var results = http.postUrl(fullApiUrl,query,options);
  var news;
  var errorMsg;
  if(results.errno != 0){
    errorMsg = "errno为0";
    throw fail.checkedError(errorMsg);
  }else {
    var speechText = "";
    news = results.data.docs.map(baseLib.createNews);
  }

  return news;
}

function getViewNewsData(newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext){
  var realLocation;
  var newsInfo;
  if (location != undefined && location != null) {
    realLocation = location;
  } else if (searchOption == "currentLocation") {
    realLocation = baseLib.getCurrentLocation(currentL);
  } else {
    realLocation = undefined;
  }

  if (realLocation != undefined){
    if(newsCategory != undefined){
      newsCategory = undefined;
    }
  }

  var news = getNews(newsCategory, dateTime, person,srcfrom,realLocation,keywords,searchOption,$vivContext);

  if(news == '' && (person!=undefined || keywords!=undefined)) {
    newsInfo = undefined;
    return newsInfo;
  }

  newsInfo= {
    news : news,
    speechText : "test",
    actionMode:"ViewNews"
  }

  if(newsCategory!=undefined){
    newsInfo.newsCategory = newsCategory;
  }
  if(dateTime!=undefined){
    newsInfo.dateTime = dateTime;
  }
  if(person!=undefined){
    newsInfo.person = person;
  }
  if(srcfrom!=undefined){
    newsInfo.srcfrom = srcfrom;
  }
  if(realLocation!=undefined){
    newsInfo.location = realLocation;
  }
  if(keywords!=undefined){
    newsInfo.keywords = keywords;
  }
  if(searchOption!=undefined){
    newsInfo.searchOption = searchOption;
  }

  newsInfo.isDetail=false;
  return  newsInfo;
}

function getPlayAudioNewsData(newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext) {
  var realLocation;
  var speechText = "";
  var newsInfo;
  var prefix = '<BST今天的腾讯新闻是>';
  if (location != undefined && location != null) {
    realLocation = location;
  } else if (searchOption == "currentLocation") {
    realLocation = baseLib.getCurrentLocation(currentL);
  } else {
    realLocation = undefined;
  }
  
  if (realLocation != undefined){
    if(newsCategory != undefined){
      newsCategory = undefined;
    }
  }
  
  var news = getNews(newsCategory, dateTime, person,srcfrom,realLocation,keywords,searchOption,$vivContext);

  if(news == '' && (person!=undefined || keywords!=undefined)) {
    newsInfo = undefined;
    return newsInfo;
  }

  for(var i=0;news!=undefined &&i<news.length;i++){
    if(i<news.length-1){
      speechText+=news[i].title + "。。。下一条新闻。。。";
    }else{
      speechText+=news[i].title;
    }
  }
  
  if (news != undefined && news != null){
    speechText = prefix + speechText;
  }

  newsInfo = {
    news : news,
    speechText : speechText
  }

  if(newsCategory!=undefined){
    newsInfo.newsCategory = newsCategory;
  }
  if(dateTime!=undefined){
    newsInfo.dateTime = dateTime;
  }
  if(person!=undefined){
    newsInfo.person = person;
  }
  if(srcfrom!=undefined){
    newsInfo.srcfrom = srcfrom;
  }
  if(realLocation!=undefined){
    newsInfo.location = realLocation;
  }
  if(keywords!=undefined){
    newsInfo.keywords = keywords;
  }
  if(searchOption!=undefined){
    newsInfo.searchOption = searchOption;
  }

  newsInfo.actionMode="PlayAudioNews";
  newsInfo.isDetail=false;

  return newsInfo;
}

function getReadNewsData(newsInfo,newsTarget,searchOption) {
  var info;
  var news = newsInfo.news;
  var size = news.length;
  var prefix = '<BST今天的腾讯新闻是>';
  console.log(newsInfo);
  if(size ==1){
    newsTarget=1;
    if(newsInfo.isDetail == true){
      info = {
        news : news,
        speechText : prefix + news[newsTarget-1].title + "。。。" + news[newsTarget-1].absL
      }
      info.isDetail = true;
    }else{
      info = {
        news : news,
        speechText : prefix + news[newsTarget-1].title
      }
      info.isDetail = false;
    }
  }else{
    if(newsTarget == "latest" && size >0){
      info = {
        news : news,
        speechText : prefix + news[size-1].title + "。。。" + news[size-1].absL
      }
    }else if(size < newsTarget || searchOption == "thisNews"){
      info = {
        news : news
      }  
    }else if(newsTarget!=undefined && newsTarget != "latest"){
      info = {
        news : news,
        speechText : prefix + news[newsTarget-1].title + "。。。" + news[newsTarget-1].absL
      }
    }else{
      var speechText = "";
      for(var i=0;i<size;i++){
        if(i<size-1){
          speechText+=news[i].title + "。。。下一条新闻。。。";
        }else{
          speechText+=news[i].title;
        }
      }
      info = {
        news : news,
        speechText : prefix + speechText
      }
    }
    info.isDetail = false;
  }
  info.actionMode="ReadNews";

  if(newsInfo.newsCategory!=undefined){
    info.newsCategory = newsInfo.newsCategory;
  }
  if(newsInfo.dateTime!=undefined){
    info.dateTime = newsInfo.dateTime;
  }
  if(newsInfo.person!=undefined){
    info.person = newsInfo.person;
  }
  if(newsInfo.srcfrom!=undefined){
    info.srcfrom = newsInfo.srcfrom;
  }
  if(newsInfo.location!=undefined){
    info.location = newsInfo.location;
  }
  if(newsInfo.keywords!=undefined){
    info.keywords = newsInfo.keywords;
  }
  if(newsInfo.searchOption!=undefined){
    info.searchOption = newsInfo.searchOption;
  }

  return info;
}

function refreshMoreNews(newsInfo){
  var actionMode = newsInfo.actionMode;
  var newsInfoR;

  if(actionMode=="ViewNews"){
    newsInfoR = getViewNewsData(newsInfo.newsCategory, newsInfo.dateTime,              newsInfo.person,newsInfo.srcfrom,newsInfo.location,newsInfo.keywords,newsInfo.searchOption);
  } else if (actionMode=="PlayAudioNews" || actionMode=="ReadNews"){
    newsInfoR = getPlayAudioNewsData(newsInfo.newsCategory, newsInfo.dateTime, newsInfo.person,newsInfo.srcfrom,newsInfo.location,newsInfo.keywords,newsInfo.searchOption);
  }

  return newsInfoR;
}






