var HttpRequestMgr = require("./HttpRequestMgr");
var Singer = require("./schema/Singer");

/**
 * 主播对象管理器，建议使用单例模式，如
 * SingerMgr.getInstance();
 */
function SingerMgr() {

}

/**
 * 搜索含有关键词searchWord的专辑列表
 * @param {string} searchWord 关键词
 * @returns {Array<Singer>} 专辑列表
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

SingerMgr.getInstance = function() {
    if (SingerMgr.instance) {
        return SingerMgr.instance;
    }

    SingerMgr.instance = new SingerMgr();
    return SingerMgr.instance;
}

module && (module.exports = SingerMgr);