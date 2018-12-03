var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");

function SearchRecentAlbumListDetailInternal(album, params, $vivContext) {
    var nullBigResult = {
        recentAlbumListDetailSearchResult: {}
    };

    if (!album) {
        return nullBigResult;
    }

    var inputParams = {
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
        album_id: album.album_id,
        pagination_cursor: 0,
        pagination_size: 30
    };

    if (params) {
        if (params.pagination_cursor) {
            inputParams.pagination_cursor = params.pagination_cursor;
        }
        if (params.pagination_size) {
            inputParams.pagination_size = params.pagination_size;
        }
    }

    var response = httpRequest.getAlbumShowList(inputParams);
    if (!response || !response.show_list || response.show_list.length == 0) {
        return nullBigResult;
    }

    var bigResult = {};
    bigResult.recentAlbumListDetailSearchResult = {
        isRecommonded: false,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        album: album,
        show_list: response.show_list.map(lib.mapToShow)
    };

    var show_ids = [];
    var showList = bigResult.recentAlbumListDetailSearchResult.show_list;
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
        }
    }

    console.log("searchRecentAlbumListDetailInternal, get the bigResult: " + JSON.stringify(bigResult));
    return bigResult;
}

function SearchRecentAlbumListDetail(album, $vivContext) {
    return SearchRecentAlbumListDetailInternal(album, {}, $vivContext);
}

module.exports.function = SearchRecentAlbumListDetail;
module.exports.SearchRecentAlbumListDetailInternal = SearchRecentAlbumListDetailInternal;
module.exports.SearchRecentAlbumListDetail = SearchRecentAlbumListDetail;