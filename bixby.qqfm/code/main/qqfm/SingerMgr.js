var HttpRequestMgr = require("./HttpRequestMgr");
var SearchedSinger = require("./schema/SearchedSinger");

/**
 * 主播对象管理器，建议使用单例模式，如
 * SingerMgr.getInstance();
 */
function SingerMgr() {}

/**
 * 搜索含有关键词searchWord的专辑列表
 * @param {string} searchWord 关键词
 * @returns {Array<SearchedSinger>} 专辑列表
 */
SingerMgr.prototype.searchSinger = function(searchWord) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var singerList = httpRequestMgr.searchSinger(searchWord);
    if (!singerList) {
        console.log("failed to search singer list for" + singerList);
        return null;
    }

    return singerList;
};

/**
 * 获取主播下面的最新专辑
 * @param {SearchedSinger} searchedSinger 主播对象
 * @returns {SingerAlbum} 主播名下的专辑
 */
SingerMgr.prototype.getRecentSingerAlbum = function(searchedSinger) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var singerAlbum = httpRequestMgr.getRecentSingerAlbum(searchedSinger);
    if (!singerAlbum) {
        console.log("failed to search recent album for" + singerAlbum);
        return null;
    }

    return singerAlbum;
}

SingerMgr.getInstance = function() {
    if (SingerMgr.instance) {
        return SingerMgr.instance;
    }

    SingerMgr.instance = new SingerMgr();
    return SingerMgr.instance;
}

module && (module.exports = SingerMgr);