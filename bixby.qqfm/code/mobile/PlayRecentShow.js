var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var ShowMgr = require("../main/qqfm/ShowMgr");
var base = require("../main/qqfm/lib/base");

module.exports.function = function playRecentShow(ePlay, eRecent, eShow, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    var showMgr = ShowMgr.getInstance();
    var showList = showMgr.getRecentShow();
    if (showList instanceof Array && showList.length > 0) {
        console.log("成功获取最近更新的节目列表");
    } else {
        console.log("获取最新更新的节目失败或者暂无更新");
        return null;
    }

    return showList.map(convertToSShow);
};

function convertToSShow(show) {
    return {
        name: show.getName ? show.getName() : "未知"
    };
}