var PlayFirst = require("./PlayFirst");
var httpRequest = require("../lib/httpRequest");
var base = require("../lib/base");

function PlayRandom(bigResult, $vivContext) {
    var ordinal = -1000;
    //ordinal 从1开始算，符合人类说法
    // make random value
    if (bigResult.singerSearchResult) {
        ordinal = getRandomIndex(bigResult.singerSearchResult.user_list);
        ordinal = getReasonableIndexForSinger(bigResult.singerSearchResult.user_list, ordinal, $vivContext);
    } else if (bigResult.singerShows) {
        ordinal = getRandomIndex(bigResult.singerShows.show_list);
    } else if (bigResult.recentAlbumListSearchResult) {
        ordinal = getRandomIndex(bigResult.recentAlbumListSearchResult.album_list);
    } else if (bigResult.recentAlbumListDetailSearchResult) {
        ordinal = getRandomIndex(bigResult.recentAlbumListDetailSearchResult.show_list);
    } else if (bigResult.recentShowListSearchResult) {
        ordinal = getRandomIndex(bigResult.recentShowListSearchResult.show_list);
    } else if (bigResult.searchAlbumResult) {
        ordinal = getRandomIndex(bigResult.searchAlbumResult.album_list);
    } else if (bigResult.searchShowResult) {
        ordinal = getRandomIndex(bigResult.searchShowResult.show_list);
    }

    console.log("PlayRandom, ordinal," + ordinal + ", bigResult:" + JSON.stringify(bigResult));
    return PlayFirst.PlayFirst(bigResult, ordinal, $vivContext);
}

function getRandomIndex(list) {
    return Math.floor((Math.random()) * (list.length)) + 1;
}

function getReasonableIndexForSinger(user_list, targetIndex, $vivContext) {
    if (ifHasAlbumForSinger(user_list[targetIndex - 1], $vivContext)) {
        return targetIndex;
    }

    for (var index = 0; index < user_list.length; index++) {
        if (index == targetIndex - 1) {
            continue;
        }

        if (ifHasAlbumForSinger(user_list[index], $vivContext)) {
            return index + 1;
        }
    }

    return -1000;
}

function ifHasAlbumForSinger(singer, $vivContext) {
    var albumListResponse = httpRequest.getSingerAlbumList({
        anchor_id: singer.anchor_id,
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid")
    });

    if (!albumListResponse || !albumListResponse.album_list || albumListResponse.album_list.length == 0) {
        return false;
    }
    return true;
}

module.exports.function = PlayRandom;