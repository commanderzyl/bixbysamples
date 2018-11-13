var CategoryMgr = require("./CategoryMgr");
var HttpRequestMgr = require("./HttpRequestMgr");
var Album = require("./schema/Album");
/**
 * 专辑管理器，建议使用单例模式，如
 * AlbumMgr.getInstance();
 */
function AlbumMgr() {

}

/**
 * 获取某个分类下的专辑信息
 * @param {string} categoryName 分类名字
 * @returns {Array<Album>} 专辑列表
 */
AlbumMgr.prototype.getAlbumList = function(categoryName) {
    var categoryMgr = CategoryMgr.getInstance();
    var category = categoryMgr.getCategoryByName(categoryName);
    if (!category) {
        console.log("failed to get category:" + categoryName);
        return null;
    }

    var httpRequestMgr = HttpRequestMgr.getInstance();
    var albumList = httpRequestMgr.getAlbumList(category);
    if (!albumList) {
        console.log("failed to get albumList for category:" + category);
        return null;
    }

    return albumList;
};

/**
 * 搜索含有关键词searchWord的专辑列表
 * @param {string} searchWord 关键词
 * @returns {Array<Album>} 专辑列表
 */
AlbumMgr.prototype.searchAlbum = function(searchWord) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var albumList = httpRequestMgr.searchAlbum(searchWord);
    if (!albumList) {
        console.log("failed to search album list for" + seachAlbum);
        return null;
    }

    return albumList;
};

/**
 * 获取最新更新的节目列表
 * @returns {Array<Album>} 专辑列表
 */
AlbumMgr.prototype.getRecentAlbum = function() {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var albumList = httpRequestMgr.getRecentAlbum();
    if (!albumList) {
        console.log("failed to search album list for" + albumList);
        return null;
    }

    return albumList;
};

/**
 * 获取某个专辑下面的节目列表
 * @param {string} albumID 专辑ID
 * @returns {Array<Show>} 节目列表
 */
AlbumMgr.prototype.getAlbumShowList = function(albumID) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var showList = httpRequestMgr.getAlbumShowList(albumID);
    if (!showList) {
        console.log("failed to search showList for" + albumID);
        return null;
    }

    return showList;
};

AlbumMgr.getInstance = function() {
    if (AlbumMgr.instance) {
        return AlbumMgr.instance;
    }

    AlbumMgr.instance = new AlbumMgr();
    return AlbumMgr.instance;
}

module && (module.exports = AlbumMgr);