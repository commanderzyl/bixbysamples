var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");

/**
 * 搜索最近更新的节目
 * @param {*} recent 
 * @param {*} params 参数应该包含这几点：
 * timestamp_start， timestamp_end， pagination_cursor，pagination_size
 * @param {*} $vivContext 
 */
function searchRecentShowListWithPagination(recent, params, $vivContext) {
    var validRecent = ["最新", "最近", "刚刚", "刚才"];
    var nullBigResult = {
        recentShowListSearchResult: {}
    };
    // 如果 recent参数不合法，则直接返回空的结果，界面提示
    // 用户未找到节目
    var index = validRecent.indexOf(recent + "");
    console.log("recent: " + recent + ", index: " + index + ", " + JSON.stringify(validRecent));
    if (index == -1) {
        console.log("searchRecentShowListWithPagination, cannot find recent: " + recent);
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

    var response = httpRequest.getRecentShowList(inputParams);

    if (!response || !response.show_list || response.show_list.length == 0) {
        return nullBigResult;
    }

    // 查找最新的专辑
    var bigResult = {};
    bigResult.recentShowListSearchResult = {
        isRecommonded: false,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        timestamp_start: response.timestamp_start,
        timestamp_end: response.timestamp_end,
        show_list: response.show_list ? response.show_list.map(lib.mapToShow) : []
    };

    // 获取节目的deeplink地址
    var show_ids = [];
    var showList = bigResult.recentShowListSearchResult.show_list;
    for (var index = 0; index < showList.length; index++) {
        showList[index].show_duration_display = lib.formatDuration(showList[index].show_duration);
        showList[index].show_create_timestamp_display = base.timeStampToDateFormat(showList[index].show_create_timestamp);
        show_ids.push(showList[index].show_id);
    }

    var show_ids_response = httpRequest.getShowInfo({
        show_ids: show_ids.join(","),
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
    });

    if (show_ids_response && show_ids_response.show_list) {
        var idsList = show_ids_response.show_list;
        for (var index = 0; index < idsList.length; index++) {
            showList[index].schema = idsList[index].schema;

            if (idsList[index].show_info && idsList[index].show_info.belong_album_info) {
                showList[index].belong_album_info = lib.mapToAlbum(idsList[index].show_info.belong_album_info);
            }
        }
    }

    console.log("searchRecentAlbumList, get the bigResult: " + JSON.stringify(bigResult));
    return bigResult;
}

function searchRecentShowList(recent, $vivContext) {
    if (!recent) {
        return null;
    }
    return searchRecentShowListWithPagination(recent, {}, $vivContext);
}

module.exports.function = searchRecentShowList;
module.exports.searchRecentShowListWithPagination = searchRecentShowListWithPagination;
module.exports.searchRecentShowList = searchRecentShowList;