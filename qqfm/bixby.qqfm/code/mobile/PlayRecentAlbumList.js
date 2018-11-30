var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");
var SearchRecentAlbumList = require("./SearchRecentAlbumList");

function PlayRecentAlbumList(recent, $vivContext) {
    if (!recent) {
        return null;
    }

    var bigResult = SearchRecentAlbumList.searchRecentAlbumList(recent, $vivContext);
    bigResult.recentAlbumListPlayResult = bigResult.recentAlbumListSearchResult;
    bigResult.recentAlbumListSearchResult = null;
    console.log("PlayRecentAlbumList, succeed to get result: " + JSON.stringify(bigResult));
    return bigResult;
}

module.exports.function = PlayRecentAlbumList;