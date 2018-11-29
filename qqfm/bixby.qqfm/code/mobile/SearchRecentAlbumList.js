var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");

/**
 * 搜索最近更新的专辑
 * @param {*} recent 
 * @param {*} params 参数应该包含这几点：
 * timestamp_start， timestamp_end， pagination_cursor，pagination_size
 * @param {*} $vivContext 
 */
function searchRecentAlbumListWithPagination(recent, params, $vivContext) {
    var validRecent = ["最新", "最近"];
    var nullBigResult = {
        recentAlbumListSearchResult: {}
    };
    // 如果 recent参数不合法，则直接返回空的结果，界面提示
    // 用户未找到专辑
    var index = validRecent.indexOf(recent + "");
    console.log("recent: " + recent + ", index: " + index + ", " + JSON.stringify(validRecent));
    if (index == -1) {
        console.log("searchRecentAlbumList, cannot find recent: " + recent);
        return nullBigResult;
    }

    var inputParams = {
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid")
    };

    if (params) {
        if (params.timestamp_start) {
            inputParams.timestamp_start = params.timestamp_start;
        }

        if (params.timestamp_end) {
            inputParams.timestamp_end = params.timestamp_end;
        }

        if (params.pagination_cursor) {
            inputParams.pagination_cursor = params.pagination_cursor;
        }

        if (params.pagination_size) {
            inputParams.pagination_size = params.pagination_size;
        }

    }
    var response = httpRequest.getRecentAlbumList(inputParams);

    if (!response) {
        return nullBigResult;
    }

    // 查找最新的专辑
    var bigResult = {};
    bigResult.recentAlbumListSearchResult = {
        isRecommonded: false,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        timestamp_start: response.timestamp_start,
        timestamp_end: response.timestamp_end,
        album_list: response.album_list ? response.album_list.map(lib.mapToAlbum) : []
    };
    console.log("searchRecentAlbumList, get the bigResult: " + JSON.stringify(bigResult));
    return bigResult;
}

function searchRecentAlbumList(recent, $vivContext) {
    return searchRecentAlbumListWithPagination(recent, {}, $vivContext);
}

module.exports.function = searchRecentAlbumList;
module.exports.searchRecentAlbumListWithPagination = searchRecentAlbumListWithPagination;