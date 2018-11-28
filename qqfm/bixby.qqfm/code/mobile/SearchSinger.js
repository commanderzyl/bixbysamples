var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function SearchSingerInternal(anchor_name, pagination_cursor, pagination_size, $vivContext) {
    var params = {};
    //首先设置deviceID
    params.deviceid = base.getUserId($vivContext.userId);
    params.appid = config.get("qqfm.appid");
    params.search_type = "singer";
    params.search_word = (anchor_name instanceof Array) ? anchor_name.join("") : anchor_name;
    params.pagination_cursor = pagination_cursor ? pagination_cursor : 0;
    params.pagination_size = pagination_size ? pagination_size : 30;

    console.log("搜索主播:" + params);
    var response = httpRequest.search(params);

    if (response.ret != '0') {
        console.log("failed to SearchSinger, " + response.ret + ", " + response.msg);
        return null;
    }

    var bigResult = {};
    bigResult.singerSearchResult = {
        isRecommonded: false,
        search_word: params.search_word,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        user_list: response.user_list ? response.user_list.map(lib.mapToSinger) : []
    };

    for (var index = 0; index < bigResult.singerSearchResult.user_list.length; index++) {
        var recentAlbum = httpRequest.getSingerAlbumList({
            deviceid: params.deviceid,
            appid: params.appid,
            anchor_id: bigResult.singerSearchResult.user_list[index].anchor_id
        });

        if (recentAlbum.ret != '0') {
            console.log("failed to getSingerAlbumList, " + recentAlbum.ret + ", " + recentAlbum.msg);
            bigResult.singerSearchResult.user_list[index].recent_album_name = "(未知)";
            continue;
        }

        if (recentAlbum.album_list && recentAlbum.album_list.length != 0) {
            bigResult.singerSearchResult.user_list[index].recent_album_name = recentAlbum.album_list[0].album_name;
        } else {
            bigResult.singerSearchResult.user_list[index].recent_album_name = "(未知)";
        }
    }
    console.log("SearchSingerInternal, bigResult:" + JSON.stringify(bigResult));
    return bigResult;
};

function SearchSinger(anchor_name, $vivContext) {
    return SearchSingerInternal(anchor_name, 0, 30, $vivContext);
}

module.exports.function = SearchSinger;
module.exports.SearchSingerInternal = SearchSingerInternal;
module.exports.SearchSinger = SearchSinger;