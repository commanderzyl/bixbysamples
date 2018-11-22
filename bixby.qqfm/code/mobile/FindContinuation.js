module.exports.function = function findContinuation(ordinal, ssinger, sAlbum, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    var result = {
        //singer: ssinger,
        //sAlbum: sAlbum
    };
  
  if (ssinger) {
    result.singer = getOrdinalResult(ordinal, ssinger.singer);
  }
  return result;
}

function getOrdinalResult(ordinal, objList) {
  var reuslt = null;
  if (ordinal != undefined) {
      if (ordinal > 0 && ordinal <= objList.length) {
        result = objList[ordinal-1];
      } else if (ordinal == -1) { //last one
        result = objList[objList.length-1];
      } else if (ordinal == -2 && objList.length >= 2) {
        result = objList[objList.length-2];
      }
  } 
  return result;
}