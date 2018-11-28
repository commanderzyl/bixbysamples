var HttpRequestMgr = require("./HttpRequestMgr");
var SearchedSinger = require("./schema/SearchedSinger");
var AlbumMgr = require("./AlbumMgr");

/**
 * 主播对象管理器，建议使用单例模式，如
 * SingerMgr.getInstance();
 */
function SingerMgr() {}

/**
 * 搜索含有关键词searchWord的主播
 * @param {string} searchWord 关键词
 * @param {obect} params 其他搜索参数, 包含分页参数
 * @returns {SearchedResult} 搜索结果
 */
SingerMgr.prototype.searchSinger = function(searchWord, params) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var searchedResult = httpRequestMgr.searchSinger(searchWord, params);
    if (!searchedResult) {
        console.log("failed to search singer list for " + searchWord);
        return null;
    }

    return searchedResult;
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

/**
 * 搜索主播下面的所有节目列表
 * @param {SearchedSinger} 主播对象
 * @param {params} 分页参数
 * {
 *  pagination_cursor: 0, 
 *  pagination_size: 30,
 * }
 * @returns {Show}
 */
SingerMgr.prototype.getSingerShows = function(searchedSinger, params) {
    // 先判断这个歌手的总节目数量
    var showNum = searchedSinger.getShowNum();
    var pagination_cursor = 0;
    var pagination_size = 30;

    if (params) {
        if (params.pagination_cursor) {
            pagination_cursor = params.pagination_cursor;
        }

        if (params.pagination_size) {
            pagination_size = params.pagination_size;
        }
    }

    if (pagination_cursor >= showNum) {
        console.log("节目游标大于节目总数量 " + pagination_cursor + ", " + showNum);
        return {
            searchedSinger: searchedSinger,

        };
    }

    var finished = false;
    var curCursor = 0;
    var curPageSize = 0;
    // 需要获取的专辑ID和数量, 存储的内容为
    // {id: , cursor:, size: }
    var targetAlbums = [];
    // 先获取前30个专辑
    var page = {
        pagination_cursor: 0,
        pagination_size: 30
    }

    while (!finished) {
        console.log("获取专辑列表, " + page);
        var albumList = this.getSingerAlbumList(searchedSinger, page);
        if (!albumList || albumList.length == 0) {
            break;
        }

        for (var index = 0; index < albumList.length; index++) {
            // 当前专辑的节目数量
            curPageSize = albumList[index].getShowNum();
            // 如果游标位于这个专辑的节目范围内
            if (pagination_cursor < (curCursor + curPageSize)) {
                // 正好获取了所有结果
                if ((pagination_cursor + pagination_size) <= (curCursor + curPageSize)) {
                    target.push({
                        id: albumList[index].getId(),
                        cursor: pagination_cursor - curCursor,
                        size: pagination_size
                    });
                    finished = true;
                    break;
                } else {
                    size = curCursor + curPageSize - pagination_cursor;
                    target.push({
                        id: albumList[index].getId(),
                        cursor: pagination_cursor - curCursor,
                        size: size
                    });
                    pagination_cursor = curCursor + curPageSize;
                    pagination_size -= size;
                    if (pagination_size <= 0) {
                        finished = true;
                        break;
                    }
                }
            }

            curCursor += curPageSize;
        }

        if (finished) {
            break;
        }

        page.pagination_cursor = curCursor;
    }

    var result = {};
    result.searchedSinger = searchedSinger;
    result.cursor = (params && params.pagination_cursor) ? params.pagination_cursor : 0;
    //result.size = (params && params.pagination_size) ? params.pagination_size : 30;
    result.show = [];
    var albumMgr = AlbumMgr.getInstance();
    for (var index = 0; index < targetAlbums.length; index++) {
        var showList = albumMgr.getAlbumShowList(targetAlbums[index].id, {
            pagination_cursor: targetAlbums[index].cursor,
            pagination_size: targetAlbums[index].size
        });

        if (!showList) {
            result.shows.push(showList);
        }
    }

    result.size = result.shows.length;
    return result;
}

/**
 * 获取某个主播下的专辑列表
 * @param {SearchedSinger} searchedSinger 主播对象
 * @param {object} params 分页参数
 * @returns {Array<SingerAlbum>} 专辑数组 
 */
SingerMgr.prototype.getSingerAlbumList = function(searchedSinger, params) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var albumList = httpRequestMgr.getSingerAlbumList(searchedSinger, params);
    if (!albumList) {
        console.log("failed to getSingerAlbumList for" + searchedSinger);
        return null;
    }

    return albumList;
}

SingerMgr.getInstance = function() {
    if (SingerMgr.instance) {
        return SingerMgr.instance;
    }

    SingerMgr.instance = new SingerMgr();
    return SingerMgr.instance;
}

module && (module.exports = SingerMgr);