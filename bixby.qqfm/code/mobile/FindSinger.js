var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var SingerMgr = require("../main/qqfm/SingerMgr");
var base = require("../main/qqfm/lib/base");

module.exports.function = function findSinger(singerName, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    var singerMgr = SingerMgr.getInstance();
    var singerList = singerMgr.searchSinger(singerName);
    if (singerList instanceof Array && singerList.length > 0) {
        console.log("成功获取含有关键词'" + singerName + "' 的主播列表");
    } else {
        console.log("获取含有关键词'" + singerName + "' 的主播失败");
        return recommenedSinger();
    }
  
    return {
      isRecommonded: false,
      singer: singerList.map(convertToSSinger)
    };
};

function convertToSSinger(singer) {
    return {
        name: singer.getName ? singer.getName() : "未知"
    };
}

function recommenedSinger() {
  return {
    isRecommended: true,
    singer:[
      {name: "主播1"},
      {name: "主播2"},
      {name: "主播3"}
    ]
  };
}