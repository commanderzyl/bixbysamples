var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function searchAlbumInternal(album_name, params, $vivContext) {
    var nullBigResult = {
        searchAlbumResult: {}
    };
    var inputParams = {
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
        search_type: "album",
        search_word: (album_name instanceof Array) ? album_name.join("") : album_name
    };

    inputParams.pagination_cursor = 0;
    inputParams.pagination_size = 30;

    if (params) {
        if (params.pagination_cursor) {
            inputParams.pagination_cursor = params.pagination_cursor;
        }

        if (params.pagination_size) {
            inputParams.pagination_size = params.pagination_size;
        }
    }

    console.log("搜索专辑:" + inputParams);
    var response = httpRequest.search(inputParams);

    if (response.ret != '0') {
        console.log("failed to searchAlbumInternal, " + response.ret + ", " + response.msg);
        return nullBigResult;
    }

    var bigResult = {};
    bigResult.searchAlbumResult = {
        isRecommonded: false,
        search_word: inputParams.search_word,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        album_list: response.album_list ? response.album_list.map(lib.mapToAlbum) : []
    };

    for (var index = 0; index < bigResult.searchAlbumResult.album_list.length; index++) {
        var showListResponse = httpRequest.getAlbumShowList({
            deviceid: inputParams.deviceid,
            appid: inputParams.appid,
            album_id: bigResult.searchAlbumResult.album_list[index].album_id
        });

        if (showListResponse.ret != '0') {
            console.log("failed to getAlbumShowList, " + showListResponse.ret + ", " + showListResponse.msg);
            continue;
        }

        if (showListResponse.show_list && showListResponse.show_list.length != 0) {
            bigResult.searchAlbumResult.album_list[index].show_list = showListResponse.show_list.map(lib.mapToShow);
        }
    }
    console.log("searchAlbumInternal, bigResult:" + JSON.stringify(bigResult));
    return bigResult;
}

function searchAlbum(album_name, $vivContext) {
    return searchAlbumInternal(album_name, {}, $vivContext);
}

module.exports.function = searchAlbum;
module.exports.searchAlbumInternal = searchAlbumInternal;
module.exports.searchAlbum = searchAlbum;