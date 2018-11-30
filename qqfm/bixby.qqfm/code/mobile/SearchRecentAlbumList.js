var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");
var SearchAlbum = require("./SearchAlbum");

/**
 * 搜索最近更新的专辑
 * @param {*} recent 
 * @param {*} params 参数应该包含这几点：
 * timestamp_start， timestamp_end， pagination_cursor，pagination_size
 * @param {*} $vivContext 
 */
function searchRecentAlbumListWithRecent(recent, params, $vivContext) {
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
        recent: recent,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        timestamp_start: response.timestamp_start,
        timestamp_end: response.timestamp_end,
        album_list: response.album_list ? response.album_list.map(lib.mapToAlbum) : []
    };

    // 获取每个专辑的schema即deeplink信息
    var album_list = bigResult.recentAlbumListSearchResult.album_list;
    for (var index = 0; index < album_list.length; index++) {
        var albumInfoResponse = httpRequest.getAlbumInfo({
            deviceid: base.getUserId($vivContext.userId),
            appid: config.get("qqfm.appid"),
            album_id: album_list[index].album_id
        });

        if (albumInfoResponse) {
            album_list[index].schema = albumInfoResponse.schema;
        }
    }
    console.log("searchRecentAlbumList, get the recent bigResult: " + JSON.stringify(bigResult));
    return bigResult;
}

function searchRecentAlbumListWithAlbumName(album_name, params, $vivContext) {
    var bigResult = SearchAlbum.searchAlbumInternal(album_name, params, $vivContext);
    var nullBigResult = {
        recentAlbumListSearchResult: {}
    };

    if (!bigResult || !bigResult.searchAlbumResult || !bigResult.searchAlbumResult.album_list) {
        return nullBigResult;
    }

    bigResult.recentAlbumListSearchResult.album_list = bigResult.searchAlbumResult.album_list;
    bigResult.recentAlbumListSearchResult.album_name = album_name;
    bigResult.recentAlbumListSearchResult.pagination_cursor = bigResult.searchAlbumResult.pagination_cursor;
    bigResult.recentAlbumListSearchResult.isRecommonded = false;
    bigResult.recentAlbumListSearchResult.has_more = bigResult.searchAlbumResult.has_more;
    bigResult.searchAlbumResult = null;
    console.log("searchRecentAlbumList, get the bigResult for album_name: " + JSON.stringify(bigResult));
    return bigResult;
}

function searchRecentAlbumListInternal(recent, params, $vivContext) {
    if (recent) {
        return searchRecentAlbumListWithRecent(recent, params, $vivContext);
    } else {
        return null;
    }
    // } else {
    //     return searchRecentAlbumListWithAlbumName(album_name, params, $vivContext);
    // }
}

function searchRecentAlbumList(recent, $vivContext) {
    return searchRecentAlbumListInternal(recent, {}, $vivContext);
}

module.exports.function = searchRecentAlbumList;
module.exports.searchRecentAlbumListInternal = searchRecentAlbumListInternal;
module.exports.searchRecentAlbumList = searchRecentAlbumList;