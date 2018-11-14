var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var AlbumMgr = require("../main/qqfm/AlbumMgr");
var base = require("../main/qqfm/lib/base");

module.exports.function = function playRecentAlbum(ePlay, eRecent, eAlbum, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    var albumMgr = AlbumMgr.getInstance();
    var albumList = albumMgr.getRecentAlbum();
    if (albumList instanceof Array && albumList.length > 0) {
        console.log("成功获取最近更新的专辑列表");
    } else {
        console.log("获取最新更新的专辑失败或者暂无更新");
        return null;
    }

    return albumList.map(convertToSAlbum);
};

function convertToSAlbum(album) {
    return {
        name: album.getName ? album.getName() : "未知"
    };
};