var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var SingerMgr = require("../main/qqfm/SingerMgr");

module.exports.function = function viewSingerDetail(singer, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    var singerMgr = SingerMgr.getInstance();
    var result = singerMgr.getSingerShows(singer);

    console.log()
    return result;
};