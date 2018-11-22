var newsApiLib = require('../lib/newsAPI.js');
var baseLib = require('../lib/base.js');

module.exports.function = function playAudioNews (newsCategory, dateTime, person,srcfrom,location,keywords,searchOption,currentL,newsDateTimeInterval,$vivContext) {
  var categoryLength;
  var index1,index2;
  var category;
  if (person != undefined){
    if(keywords != undefined || location != undefined || newsCategory != undefined){
      newsCategory = keywords = location = undefined;
    }
  }
  if (keywords != undefined){
    if(location != undefined || newsCategory != undefined){
      newsCategory = location = undefined;
    }
  }
  
    if (newsCategory != null || newsCategory != undefined){
    categoryLength = newsCategory.length;
    for (var i =0;i < categoryLength;i++) {
      if (categoryLength == 1 || newsCategory[i] == undefined) break;
      var length = categoryLength -1;
      console.log(newsCategory[i])
      index1 = baseLib.getIndexOfArray(newsCategory[i],baseLib.categoryR1);
      index2 = baseLib.getIndexOfArray(newsCategory[i],baseLib.categoryR2);
      console.log(index1)
      console.log(index2)
      if (index1 != -1 || index2 != -1){
        newsCategory.shift();
        console.log(newsCategory)
      } 
    }
    category = newsCategory[0];
    console.log(newsCategory[0])    
  }
  var newsInfo = newsApiLib.getPlayAudioNewsData(category, dateTime, person,srcfrom,location,keywords,searchOption,currentL,$vivContext);
  return newsInfo;
}

