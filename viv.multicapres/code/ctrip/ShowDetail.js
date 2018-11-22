var base = require('./lib/Base.js');
function showDetail(recommendData, dataInfo, orderByRule) {
  if (recommendData != undefined) {
    return base.getDataInfo(recommendData);
  }
  if (dataInfo != undefined) {
    return base.getDataInfo(dataInfo);
  }
  if(orderByRule != undefined){
    return base.getDataInfo(orderByRule);
  }
  
  return null;
}

module.exports = {
  function: showDetail
}
