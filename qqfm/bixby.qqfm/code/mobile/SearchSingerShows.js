var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function SearchSingerShowsInternal(singer, pagination_cursor, pagination_size, $vivContext) {
    console.log("SearchSingerShowsInternal, " + JSON.stringify(singer) + ", " +
        pagination_cursor + ", " + pagination_size);
    var params = {};
    //首先设置deviceID
    params.deviceid = base.getUserId($vivContext.userId);
    params.appid = config.get("qqfm.appid");
    params.pagination_cursor = pagination_cursor ? pagination_cursor : 0;
    params.pagination_size = pagination_size ? pagination_size : 30;
    var singerShows = httpRequest.getSingerShows(singer, params);
    var bigResult = {};
    // 针对每个节目，添加时长和时间戳的文本显示
    if (singerShows && singerShows.show_list) {
        singerShows.show_list = singerShows.show_list.map(lib.mapToShow);
        var showList = singerShows.show_list;
        for (var index = 0; index < showList.length; index++) {
            showList[index].show_duration_display = lib.formatDuration(showList[index].show_duration);
            showList[index].show_create_timestamp_display = base.timeStampToDateFormat(showList[index].show_create_timestamp);
        }
    }
    bigResult.singerShows = singerShows;
    console.log("SearchSingerShowsInternal, bigResult:" + JSON.stringify(bigResult));
    return bigResult;
}

function SearchSingerShows(singer, $vivContext) {
    return SearchSingerShowsInternal(singer, 0, 30, $vivContext);
}

module.exports.function = SearchSingerShows;
module.exports.SearchSingerShowsInternal = SearchSingerShowsInternal;
module.exports.SearchSingerShows = SearchSingerShows;