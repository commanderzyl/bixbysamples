var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var SingerMgr = require("../main/qqfm/SingerMgr");
var base = require("../main/qqfm/lib/base");
var SearchedResult = require("../main/qqfm/schema/SearchedResult");

module.exports.function = function findSinger(singerName, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    //主播名
    var name = singerName.join("");
    console.log("搜索主播:" + name);
    var singerMgr = SingerMgr.getInstance();
    var searchedResult = singerMgr.searchSinger(name);
    var singerList = searchedResult.getSearchResult();
    if (singerList instanceof Array && singerList.length > 0) {
        console.log("成功获取含有关键词'" + name + "' 的主播列表");
    } else {
        console.log("获取含有关键词'" + name + "' 的主播失败");
        return recommenedSinger();
    }


    singerList = singerList.map(convertToSSinger);
    return {
        isRecommonded: false,
        searchType: "主播",
        searchedSinger: singerList
    }
};

function convertToSSinger(ssinger) {
    var searchedSinger = {
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

function recommenedSinger() {
    return {
        isRecommonded: true,
        searchType: "主播",
        searchedSinger: [
            { name: "主播1" },
            { name: "主播2" },
            { name: "主播3" }
        ]
    };
}