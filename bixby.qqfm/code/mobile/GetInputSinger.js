var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var SingerMgr = require("../main/qqfm/SingerMgr");
var base = require("../main/qqfm/lib/base");
var SearchedResult = require("../main/qqfm/schema/SearchedResult");

module.exports.function = function getInputSinger(keyword, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));

    console.log("获取推荐主播:" + keyword);
    var singerMgr = SingerMgr.getInstance();
    var searchedResult = singerMgr.searchSinger(keyword);
    var singerList = searchedResult.getSearchResult();
    if (singerList instanceof Array && singerList.length > 0) {
        console.log("成功获取含有关键词'" + keyword + "' 的主播列表");
    } else {
        console.log("获取含有关键词'" + keyword + "' 的主播失败");
        return null;
    }

    return singerList.map(convertToSSinger);
}

function convertToSSinger(ssinger) {
    var searchedSinger = {
        isRecommonded: false,
        ID: ssinger.getId(),
        name: ssinger.getName(),
        albumNum: ssinger.getAlbumNum(),
        fansNum: ssinger.getFansNum(),
        showNum: ssinger.getShowNum(),
        logoUri: ssinger.getLogoUri()
    };

    var singerMgr = SingerMgr.getInstance();
    // 获取最新专辑名字
    var singerAlbum = singerMgr.getRecentSingerAlbum(ssinger);
    console.log("convertToSSinger, " + singerAlbum);
    if (singerAlbum) {
        searchedSinger.recentAlbumName = singerAlbum.getName();
    }

    return searchedSinger;
}