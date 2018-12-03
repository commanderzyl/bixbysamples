var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");
var SearchAlbum = require("./SearchAlbum");

function PlayAlbum(album_name, album_id, $vivContext) {
    if (album_id) {
        return PlayAlbumWithId(album_id, $vivContext);
    } else {
        return PlayAlbumWithName(album_name, $vivContext);
    }

}

function PlayAlbumWithId(album_id, $vivContext) {
    var response = httpRequest.getAlbumInfo({
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
        album_id: album_id
    });

    if (response && response.schema) {
        return {
            playAlbumResult: { schema: response.schema }
        }

    }
    return null;
}

function PlayAlbumWithName(album_name, $vivContext) {
    var bigResult = SearchAlbum.searchAlbum(album_name, $vivContext);

    if (bigResult.searchAlbumResult && bigResult.searchAlbumResult.album_list) {
        var album_list = bigResult.searchAlbumResult.album_list;
        if (album_list.length != 0) {
            return {
                playAlbumResult: { schema: album_list[0].schema }
            }
        }
    }
    return null;
}

module.exports.function = PlayAlbum;
module.exports.PlayAlbumWithId = PlayAlbumWithId;