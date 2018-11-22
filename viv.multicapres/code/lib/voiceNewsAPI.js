var voiceBaseLib = require('lib/voiceNewsBase.js');

module.exports = {
  refreshVoiceNews:refreshVoiceNews,
  getPlayVoiceNewsData:getPlayVoiceNewsData
}

function getPlayVoiceNewsData (newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext) {
  var params = ''; 
  var audioItem = [];
  var uri = '';
  var result = undefined;

  var newsInfo = voiceBaseLib.getPlayVoiceNewsData(newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext);
  console.log(newsInfo)

  if (newsInfo != undefined){
    audioItem = voiceBaseLib.getAudioItem(newsInfo);
    params = voiceBaseLib.addParameter(params, "caller", "bixby");
    params = voiceBaseLib.addParameter(params, "displayName", "腾讯新闻");
    params = voiceBaseLib.addParameter(params, "category", "PODCAST");
    params = voiceBaseLib.addParameter(params, "playBehavior", "REPLACE_ALL");
    params = voiceBaseLib.addParameter(params, "audioItem", audioItem);
    uri = voiceBaseLib.composeURI(config.get("lux.packagename"), "Play", "Background", params);        
  }

  if (uri != ''){
    result =  {
      uri: uri,
      newsInfo:newsInfo
    }
  }
  return result;
}

function refreshVoiceNews(result,type,action,$vivContext){
  var newsInfo = result.newsInfo;
  var actionResult;
  if (newsInfo != undefined) {
    actionResult = getPlayVoiceNewsData(newsInfo.newsCategory, newsInfo.dateTime, newsInfo.person,newsInfo.srcfrom,newsInfo.location,newsInfo.keywords,newsInfo.searchOption,'',$vivContext);
  } else{
    actionResult = getPlayVoiceNewsData('', '', '','','','','','',$vivContext);    
  }

  return actionResult;
}
