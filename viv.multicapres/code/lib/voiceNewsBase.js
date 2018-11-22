var baseLib = require('lib/base.js');

var BaseUrl = {
  generateVoiceUrl:"http://vi.smartnews.qq.com:80/v2/open/article_search?",
}

const streamFormat = "audio/mpeg";

module.exports = {
  composeURI : composeURI,
  addParameter : addParameter,
  getAudioItem : getAudioItem,
  getPlayVoiceNewsData : getPlayVoiceNewsData
}

function getQuerySearchBody(newsCategory,dateTime,person,srcFrom,location,keywords,searchOption,$vivContext,onlyVoice){ 
  var userId = "1111111";
  var from_time = "";
  var end_time = "";

  if(newsCategory!=undefined && newsCategory!=''){
    newsCategory = baseLib.hanziConvrtToUnicode(newsCategory);
  }
  if(person!=undefined && person!=''){
    person = baseLib.hanziConvrtToUnicode(person);
  }
  if(location!=undefined && location !=''){
    location = baseLib.hanziConvrtToUnicode(location);
  }
  if(keywords!=undefined && keywords!=''){
    keywords = baseLib.hanziConvrtToUnicode(keywords);
  }
  if(srcFrom!=undefined){
    srcFrom = baseLib.hanziConvrtToUnicode(srcFrom); 
  }
  if(dateTime!=undefined && dateTime !=''){
    from_time = baseLib.getFromTime(dateTime);
    console.log("from_time is " + from_time)
    end_time = baseLib.getTimeStamp();
    console.log("end_time is " + end_time)
  }

  if($vivContext && $vivContext.userId){
    userId = baseLib.getUserId($vivContext.userId);
  }

  var query = {"uid":userId,"qid":"2222","raw_query":"test","req_num":"10","res_from_time":from_time,"res_end_time":end_time,"query_info":{"news_category":(newsCategory!=undefined)?newsCategory:"","date_time":"","person":(person!=undefined)?person:"", "location":(location!=undefined)?location:"","keywords":(keywords!=undefined)?keywords:"","srcfrom":(srcFrom!=undefined)?srcFrom:"","onlyVoice":onlyVoice}};

  query = JSON.stringify(query).replace(/\\u/g,'\u'); 
  return query;
}

function requestNewsInfo(newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext,onlyVoice) {
  var apiUrl = BaseUrl.generateVoiceUrl;  
  var generateQueryUrl = new baseLib.generateQueryUrl(); 
  var timestamp = baseLib.getTimeStamp();
  var sign = generateVoiceSign(newsCategory,dateTime,person,srcfrom,location,keywords,searchOption,$vivContext,onlyVoice);

  generateQueryUrl.append("appid",config.get("news.appid"));
  generateQueryUrl.append("timestamp",timestamp);
  generateQueryUrl.append("sign",sign);
  var fullApiUrl = apiUrl + generateQueryUrl.getQuery(); 

  if($vivContext && $vivContext.userId){
    userId = baseLib.getUserId($vivContext.userId);
  }

  var query = getQuerySearchBody(newsCategory,dateTime,person,srcfrom,location,keywords,searchOption,$vivContext,onlyVoice)
  console.log(query)

  var results = http.postUrl(
    fullApiUrl,query, {           
      format: 'json',
      headers: {
        "Content-Type":'application/json',
        "Accept":'text/plain'
      }
    }
  );

  return results;
}

function generateVoiceSign(category,dateTime,person,from,location,keywords,searchOption,$vivContext,onlyVoice){
  var query =getQuerySearchBody(category,dateTime,person,from,location,keywords,searchOption,$vivContext,onlyVoice);
  var md5s = config.get("news.appid") + config.get("news.appSecret")+ query + baseLib.getTimeStamp(); 
  console.log(md5s);
  return md5.generate(md5s);
}


function composeURI(domain, actionId, uriType, parameters) { 
  var uri = "bixby://"+ domain + "/" + actionId + "/" + uriType
  if (parameters) { 
    uri +=  "?" + parameters 
  } 
  return uri; 
} 

function addParameter(str, key, value) { 
  if (value != undefined && value != null && value != "") { 
    if (str) { 
      str += "&" + key + "=" + value; 
    } else { 
      str+= key + "=" + value; 
    } 
  } 
  return str; 
} 

function getAudioItem(newsInfo) { 
  var audioItem = [];
  var news = newsInfo.news;

  if(newsInfo != undefined && news!=undefined ){
    for(var i=0;i<news.length;i++){
      console.log(news[i])
      var radioResult = new Object();
      radioResult.id="tencentnews" + i;
      radioResult.stream = [];
      var streamsResult = new Object();
      streamsResult.token = "123456";  
      streamsResult.url = news[i].voiceSummary;
      streamsResult.format = streamFormat;
      streamsResult.offsetInMilliseconds = 0;
      streamsResult.expiryTime = "none"; 
      radioResult.stream.push(streamsResult);
      radioResult.metadataTitle = news[i].title;
      radioResult.metadataArtist = news[i].srcfrom;
      radioResult.metadataAlbumartUrl = news[i].shortcut;
      audioItem.push(radioResult)
    }
  }

  return JSON.stringify(audioItem);
}

function getPlayVoiceNewsData(newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext) {
  var news;
  var speechText = '';
  var onlyVoice = true;
  var newsInfo;
  var results;

  if(newsCategory==undefined){
    newsCategory = '';
  }
  if(person==undefined){
    person = '';
  }

  if (location != undefined && location != null) {
    realLocation = location;
  } else if (searchOption == "currentLocation") {
    console.log(currentL)
    realLocation = baseLib.getCurrentLocation(currentL);
  } else {
    realLocation = '';
  }

  if(keywords==undefined){
    keywords = '';
  }
  if(dateTime==undefined){
    dateTime = '';
  }

  results = requestNewsInfo(newsCategory, dateTime, person,srcfrom,realLocation,keywords,searchOption,currentL,$vivContext,true);

  if(results.data.docs.length == 0){
    console.log("data length is 0")
    results = requestNewsInfo(newsCategory, dateTime, person,srcfrom,realLocation,keywords,searchOption,currentL,$vivContext,false);
    onlyVoice = false;
  }

  if(results.errno != 0){
    throw fail.checkedError("errno为0");
  }else{
    news = results.data.docs.map(baseLib.createNews); 
  }

  if(news == '' && (person!=undefined || keywords!=undefined)) {
    return undefined;
  }

  if (onlyVoice == false) {
    for(var i=0;news!=undefined &&i<news.length;i++){
      if(i<news.length-1){
        speechText+=news[i].title + "。。。" + news[i].absS + "。。。下一条新闻。。。";
      }else{
        speechText+=news[i].title + "。。。" + news[i].absS;
      }
    }
    newsInfo = {
      news : news,
      speechText : speechText
    }
  }else{
    newsInfo = {
      news : news
    }   
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

  newsInfo.actionMode="PlayVoiceNews";
  newsInfo.isDetail=false;

  return newsInfo;
}
