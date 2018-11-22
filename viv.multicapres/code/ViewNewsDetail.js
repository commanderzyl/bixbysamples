module.exports.function = function ViewNewsDetail(news,newsInfo,newsTarget,type,action,indexNews){
  var result,news1;
  var resultIndex = 1;
  if(newsInfo[0] == null && news == null) {
    return undefined;
  } 

  console.log(newsInfo)
  if (newsInfo[0] != null && newsInfo[0] != undefined && news == null) {
    news1 = newsInfo[0].news;
    console.log(news1)
    if ((news1 != null && news1.length == 0) || news1 == null) return undefined;
    if (indexNews != null && indexNews != undefined) {
      if(indexNews == 0) {
        resultIndex = 1;
      } else {
        resultIndex = indexNews;
      }  
    } else if (newsTarget != null && newsTarget != undefined) {
      if (newsTarget == "latest") {
        resultIndex = news1.length
      } else if (newsTarget == "-2"){
        if(news1.length >= 2){
          resultIndex = news1.length-1;
        }else{
          resultIndex = news1.length + 1;
        }
      } else if (newsTarget <= news1.length){
        resultIndex = newsTarget;
      } else {
        resultIndex = news1.length + 1;
      }
    }
    
    console.log(resultIndex)

    if (news1 != null  && resultIndex > news1.length){
      return undefined;
    }else {
      return result = {
        news: news1[resultIndex-1],
        isDetail:true,
      }     
    }
  }

  if (newsInfo[0] == null && news != null) {
    return result = {
      news: news,
      isDetail:true,
    } 
  }

  return result;
}
