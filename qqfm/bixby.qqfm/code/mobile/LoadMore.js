var SearchSinger = require("./SearchSinger");
var SearchSingerShows = require("./SearchSingerShows");
var SearchRecentAlbumList = require("./SearchRecentAlbumList");
var SearchRecentAlbumListDetail = require("./SearchRecentAlbumListDetail");
var SearchRecentShowList = require("./SearchRecentShowList");
var SearchAlbum = require("./SearchAlbum");
var SearchShow = require("./SearchShow");

function LoadMore(bigResult, $vivContext) {
    console.log("LoadMore, " + JSON.stringify(bigResult));

    if (!bigResult) {
        return null;
    }

    var pagination_cursor = 0;
    var pagination_size = 30;

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

    } else if (bigResult.recentAlbumListSearchResult) { // 搜索最近更新的专辑列表
        if (bigResult.recentAlbumListSearchResult.has_more == 1) {
            pagination_cursor += bigResult.recentAlbumListSearchResult.pagination_cursor +
                bigResult.recentAlbumListSearchResult.pagination_size;
            return SearchRecentAlbumList.searchRecentAlbumListInternal(
                "最近", {
                    timestamp_start: bigResult.recentAlbumListSearchResult.timestamp_start,
                    timestamp_end: bigResult.recentAlbumListSearchResult.timestamp_end,
                    pagination_cursor: pagination_cursor,
                    pagination_size: pagination_size
                }, $vivContext
            );
        }
    } else if (bigResult.recentAlbumListDetailSearchResult) { // 搜索最近更新的专辑下的节目列表
        if (bigResult.recentAlbumListDetailSearchResult.has_more == 1) {
            pagination_cursor += bigResult.recentAlbumListDetailSearchResult.pagination_cursor +
                bigResult.recentAlbumListDetailSearchResult.pagination_size;
            return SearchRecentAlbumListDetail.SearchRecentAlbumListDetailInternal(
                bigResult.recentAlbumListDetailSearchResult.album, {
                    pagination_cursor: pagination_cursor,
                    pagination_size: pagination_size
                }, $vivContext
            );
        }
    } else if (bigResult.recentShowListSearchResult) { // 搜索最近更新的节目列表
        if (bigResult.recentShowListSearchResult.has_more == 1) {
            pagination_cursor += bigResult.recentShowListSearchResult.pagination_cursor +
                bigResult.recentShowListSearchResult.pagination_size;
            return SearchRecentShowList.searchRecentShowListWithPagination(
                "最近", {
                    timestamp_start: bigResult.recentShowListSearchResult.timestamp_start,
                    timestamp_end: bigResult.recentShowListSearchResult.timestamp_end,
                    pagination_cursor: pagination_cursor,
                    pagination_size: pagination_size
                }, $vivContext
            );
        }
    } else if (bigResult.searchAlbumResult) { // 搜索专辑
        if (bigResult.searchAlbumResult.has_more == 1) {
            pagination_cursor += bigResult.searchAlbumResult.pagination_cursor +
                bigResult.searchAlbumResult.pagination_size;
            return SearchAlbum.searchAlbumInternal(
                bigResult.searchAlbumResult.search_word, {
                    pagination_cursor: pagination_cursor,
                    pagination_size: pagination_size
                }, $vivContext
            );
        }
    } else if (bigResult.searchShowResult) { // 搜索节目
        if (bigResult.searchShowResult.has_more == 1) {
            pagination_cursor += bigResult.searchShowResult.pagination_cursor +
                bigResult.searchShowResult.pagination_size;
            return SearchShow.searchShowInternal(
                bigResult.searchShowResult.search_word, {
                    pagination_cursor: pagination_cursor,
                    pagination_size: pagination_size
                }, $vivContext
            );
        }
    }

    console.log("load more, do nothing, just return: " + JSON.stringify(bigResult));
    return bigResult;
}

module.exports.function = LoadMore;