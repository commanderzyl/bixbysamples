var SearchSinger = require("./SearchSinger");
var SearchSingerShows = require("./SearchSingerShows");

function LoadMore(bigResult, $vivContext) {
    console.log("LoadMore, " + JSON.stringify(bigResult));

    if (!bigResult) {
        return null;
    }

    // 加载更多的主播列表
    if (bigResult.singerSearchResult && bigResult.singerSearchResult.has_more == 1) {
        bigResult.singerSearchResult.pagination_cursor += bigResult.singerSearchResult.pagination_size;
        bigResult.singerSearchResult.pagination_size = 30;
        return SearchSinger.SearchSingerInternal(bigResult.singerSearchResult.search_word,
            bigResult.singerSearchResult.pagination_cursor, bigResult.singerSearchResult.pagination_size, $vivContext);
    } else if (bigResult.singerShows && bigResult.singerShows.has_more == 1) { // 加载主播名下更多的节目
        bigResult.singerShows.pagination_cursor += bigResult.singerShows.pagination_size;
        bigResult.singerShows.pagination_size = 30;
        return SearchSingerShows.SearchSingerShowsInternal(bigResult.singerShows.singer,
            bigResult.singerShows.pagination_cursor, bigResult.singerShows.pagination_size, $vivContext);

    } 

    console.log("load more, do nothing, just return: " + JSON.stringify(bigResult));
    return bigResult;
}

module.exports.function = LoadMore;