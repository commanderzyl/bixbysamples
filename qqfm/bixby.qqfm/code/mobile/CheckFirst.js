var SearchSingerShows = require("./SearchSingerShows");

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
    }

    console.log("checkFirst, bad input, " + ordinal + ", " + JSON.stringify(bigResult));
    bigResult.check_first = {
        check_result: 1 //失败
    };
    return bigResult;
}

function checkSearchedSinger(ordinal, bigResult, $vivContext) {
    var user_list = bigResult.singerSearchResult.user_list;
    if (!user_list) {
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
        bigResult.check_first = {
            check_result: 1 //失败
        };
        return bigResult;
    }

    // 查看第几个节目，在这个节目列表界面，其实就是播放，所以我们要返回新的结果。
    // 同时为了避免result-view显示有误，删除不必要的属性
    bigResult.singerShows = null;
    console.log("check first, 播放第 " + ordinal + " 节目, url = " + JSON.stringify(show.play_url));
    bigResult.check_first = {
        check_result: 0, //成功
        deeplink_uri: {
            uri: "nextradio://a/playshow?notjumpplayer=0&showid=13943903"
        }
    };
    return bigResult;
}

module.exports.function = CheckFirst;
module.exports.CheckFirst = CheckFirst;