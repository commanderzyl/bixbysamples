var SearchSingerShows = require("./SearchSingerShows");
var PlayShow = require("./PlayShow");
var SearchRecentAlbumListDetail = require("./SearchRecentAlbumListDetail");

function CheckFirst(bigResult, ordinal, $vivContext) {
    if (!ordinal || !bigResult) {
        if (!bigResult) {
            bigResult = {};
        }

        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    if (bigResult.singerSearchResult) {
        return checkSearchedSinger(ordinal, bigResult, $vivContext);
    } else if (bigResult.singerShows) {
        return checkSingerShows(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentAlbumListSearchResult) {
        return checkRecentAlbumListSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentAlbumListDetailSearchResult) {
        return checkRecentAlbumListDetailSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentShowListSearchResult) {
        return checkRecentShowListSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.searchAlbumResult) {
        return checkSearchAlbumResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.searchShowResult) {
        return checkSearchShowResult(ordinal, bigResult, $vivContext);
    }

    console.log("checkFirst, bad input, " + ordinal + ", " + JSON.stringify(bigResult));
    bigResult = {};
    bigResult.check_first = {
        check_result: 1 //失败
    };
    return bigResult;
}

function checkRecentAlbumListSearchResult(ordinal, bigResult, $vivContext) {
    var album_list = bigResult.recentAlbumListSearchResult.album_list;
    if (!album_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var album = null;
    if (ordinal > 0 && ordinal <= album_list.length) {
        album = (album_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        album = (album_list[album_list.length - 1]);
    } else if (ordinal == -2 && album_list.length >= 2) {
        album = (album_list[album_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    console.log("check first, checkRecentAlbumListSearchResult: the " + ordinal + " album: " + JSON.stringify(album));
    var recentAlbumListDetailSearchResult = SearchRecentAlbumListDetail.SearchRecentAlbumListDetail(album, $vivContext);
    recentAlbumListDetailSearchResult.check_first = {
        check_result: 0 //成功
    };
    return recentAlbumListDetailSearchResult;
}

function checkRecentAlbumListDetailSearchResult(ordinal, bigResult, $vivContext) {
    var show_list = bigResult.recentAlbumListDetailSearchResult.show_list;
    if (!show_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var show = null;
    if (ordinal > 0 && ordinal <= show_list.length) {
        show = (show_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        show = (show_list[show_list.length - 1]);
    } else if (ordinal == -2 && show_list.length >= 2) {
        show = (show_list[show_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("check first, recentAlbumListDetailSearchResult:  " + ordinal + " deeplink = " + uri);
    bigResult.check_first = {
        check_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function checkRecentShowListSearchResult(ordinal, bigResult, $vivContext) {
    var show_list = bigResult.recentShowListSearchResult.show_list;
    if (!show_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var show = null;
    if (ordinal > 0 && ordinal <= show_list.length) {
        show = (show_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        show = (show_list[show_list.length - 1]);
    } else if (ordinal == -2 && show_list.length >= 2) {
        show = (show_list[show_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("check first, recentShowListSearchResult:  " + ordinal + " deeplink = " + uri);
    bigResult.check_first = {
        check_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function checkSearchAlbumResult(ordinal, bigResult, $vivContext) {
    var album_list = bigResult.searchAlbumResult.album_list;
    if (!album_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var album = null;
    if (ordinal > 0 && ordinal <= album_list.length) {
        album = (album_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        album = (album_list[album_list.length - 1]);
    } else if (ordinal == -2 && album_list.length >= 2) {
        album = (album_list[album_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    console.log("check first, checkSearchAlbumResult: the " + ordinal + " album: " + JSON.stringify(album));
    var recentAlbumListDetailSearchResult = SearchRecentAlbumListDetail.SearchRecentAlbumListDetail(album, $vivContext);
    recentAlbumListDetailSearchResult.check_first = {
        check_result: 0 //成功
    };
    return recentAlbumListDetailSearchResult;
}

function checkSearchShowResult(ordinal, bigResult, $vivContext) {
    var show_list = bigResult.searchShowResult.show_list;
    if (!show_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var show = null;
    if (ordinal > 0 && ordinal <= show_list.length) {
        show = (show_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        show = (show_list[show_list.length - 1]);
    } else if (ordinal == -2 && show_list.length >= 2) {
        show = (show_list[show_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("check first, checkSearchShowResult: " + ordinal + ", deeplink = " + uri);
    bigResult.check_first = {
        check_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function checkSearchedSinger(ordinal, bigResult, $vivContext) {
    var user_list = bigResult.singerSearchResult.user_list;
    if (!user_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var singer = null;
    if (ordinal > 0 && ordinal <= user_list.length) {
        singer = (user_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        singer = (user_list[user_list.length - 1]);
    } else if (ordinal == -2 && user_list.length >= 2) {
        singer = (user_list[user_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    console.log("check first, check the " + ordinal + " singer: " + JSON.stringify(singer));
    var singerBigResult = SearchSingerShows.SearchSingerShows(singer, $vivContext);
    singerBigResult.check_first = {
        check_result: 0 //成功
    };
    return singerBigResult;
}

function checkSingerShows(ordinal, bigResult, $vivContext) {
    var show_list = bigResult.singerShows.show_list;
    if (!show_list) {
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    var show = null;
    if (ordinal > 0 && ordinal <= show_list.length) {
        show = (show_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        show = (show_list[show_list.length - 1]);
    } else if (ordinal == -2 && show_list.length >= 2) {
        show = (show_list[show_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("check first, 播放第 " + ordinal + " 节目, deeplink = " + uri);
    bigResult.check_first = {
        check_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

module.exports.function = CheckFirst;
module.exports.CheckFirst = CheckFirst;