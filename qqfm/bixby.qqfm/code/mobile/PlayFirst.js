var httpRequest = require("../lib/httpRequest");
var PlayShow = require("./PlayShow");
var PlayAlbum = require("./PlayAlbum");
var base = require("../lib/base");

function PlayFirst(bigResult, ordinal, $vivContext) {
    if (!ordinal || !bigResult) {
        if (!bigResult) {
            bigResult = {};
        }

        bigResult.play_first = {
            play_result: 1 //失败
        };
        return bigResult;
    }

    if (bigResult.singerSearchResult) {
        return playSingerSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.singerShows) {
        return playSingerShows(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentAlbumListSearchResult) {
        return playRecentAlbumListSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentAlbumListDetailSearchResult) {
        return playRecentAlbumListDetailSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.recentShowListSearchResult) {
        return playRecentShowListSearchResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.searchAlbumResult) {
        return playSearchAlbumResult(ordinal, bigResult, $vivContext);
    } else if (bigResult.searchShowResult) {
        return playSearchShowResult(ordinal, bigResult, $vivContext);
    }

    console.log("PlayFirst, bad input, " + ordinal + ", " + JSON.stringify(bigResult));
    bigResult = {};
    bigResult.play_first = {
        play_result: 1 //失败
    };
    return bigResult;
}

function playSingerShows(ordinal, bigResult, $vivContext) {
    var show_list = bigResult.singerShows.show_list;
    if (!show_list) {
        bigResult = {};
        bigResult.play_first = {
            play_result: 1 //失败
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
        bigResult.play_first = {
            play_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放，所以我们要返回新的结果。
    // 同时为了避免result-view显示有误，删除不必要的属性
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("play first, 播放第 " + ordinal + " 节目, url = " + uri);
    bigResult.play_first = {
        play_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function playSingerSearchResult(ordinal, bigResult, $vivContext) {
    console.log("playSingerSearchResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    var singer_list = bigResult.singerSearchResult.user_list;
    var singer = null;
    if (ordinal > 0 && ordinal <= singer_list.length) {
        singer = (singer_list[ordinal - 1]);
    } else if (ordinal == -1) { //last one
        singer = (singer_list[singer_list.length - 1]);
    } else if (ordinal == -2 && singer_list.length >= 2) {
        singer = (singer_list[singer_list.length - 2]);
    } else {
        //非法序数
        bigResult = {};
        bigResult.play_first = {
            play_result: 1 //失败
        };
        return bigResult;
    }

    var albumListResponse = httpRequest.getSingerAlbumList({
        anchor_id: singer.anchor_id,
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid")
    });

    if (!albumListResponse || !albumListResponse.album_list || albumListResponse.album_list.length == 0) {
        bigResult = {};
        bigResult.play_first = {
            play_result: 2 //失败
        };
        return bigResult;
    }
    var uri = PlayAlbum.PlayAlbumWithId(albumListResponse.album_list[0].album_id, $vivContext).playAlbumResult.schema;

    bigResult = {};
    console.log("playSingerSearchResult, 播放第 " + ordinal + " 专辑, url = " + uri);
    bigResult.play_first = {
        play_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function playRecentAlbumListSearchResult(ordinal, bigResult, $vivContext) {
    console.log("playRecentAlbumListSearchResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return playAlbum(bigResult.recentAlbumListSearchResult.album_list, ordinal, $vivContext);
}

function playRecentAlbumListDetailSearchResult(ordinal, bigResult, $vivContext) {
    console.log("playRecentAlbumListDetailSearchResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return playShow(bigResult.recentAlbumListDetailSearchResult.show_list, ordinal, $vivContext);
}

function playRecentShowListSearchResult(ordinal, bigResult, $vivContext) {
    console.log("playRecentShowListSearchResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return playShow(bigResult.recentShowListSearchResult.show_list, ordinal, $vivContext);
}

function playSearchAlbumResult(ordinal, bigResult, $vivContext) {
    console.log("playSearchAlbumResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return playAlbum(bigResult.searchAlbumResult.album_list, ordinal, $vivContext);
}

function playSearchShowResult(ordinal, bigResult, $vivContext) {
    console.log("playSearchShowResult, ordinal:" + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return playShow(bigResult.searchShowResult.show_list, ordinal, $vivContext);
}

function playAlbum(album_list, ordinal, $vivContext) {
    if (!album_list) {
        bigResult = {};
        bigResult.play_first = {
            play_result: 1 //失败
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
        bigResult.play_first = {
            play_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放，所以我们要返回新的结果。
    // 同时为了避免result-view显示有误，删除不必要的属性
    //var uri = album.schema;
    //if (!uri) {
    var uri = PlayAlbum.PlayAlbumWithId(album.album_id, $vivContext).playAlbumResult.schema;
    // }

    var bigResult = {};
    console.log("play first, 播放第 " + ordinal + " 专辑, url = " + uri);
    bigResult.play_first = {
        play_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

function playShow(show_list, ordinal, $vivContext) {
    if (!show_list) {
        bigResult = {};
        bigResult.play_first = {
            play_result: 1 //失败
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
        bigResult.play_first = {
            play_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放，所以我们要返回新的结果。
    // 同时为了避免result-view显示有误，删除不必要的属性
    var uri = PlayShow.PlayShowWidthId(show.show_id, $vivContext).playShowResult.schema;
    var bigResult = {};
    console.log("play first, 播放第 " + ordinal + " 节目, url = " + uri);
    bigResult.play_first = {
        play_result: 0, //成功
        deeplink_uri: {
            uri: uri
        }
    };
    return bigResult;
}

module.exports.function = PlayFirst;
module.exports.PlayFirst = PlayFirst;