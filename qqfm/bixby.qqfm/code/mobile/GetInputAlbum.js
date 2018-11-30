var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function GetInputAlbum(search_word, $vivContext) {
    var params = {};
    //首先设置deviceID
    params.deviceid = base.getUserId($vivContext.userId);
    params.appid = config.get("qqfm.appid");
    params.search_type = "album";
    params.search_word = search_word;
    params.pagination_cursor = 0;
    params.pagination_size = 30;

    console.log("搜索专辑:" + params);
    var response = httpRequest.search(params);

    if (response.ret != '0') {
        console.log("failed to GetInputAlbum, " + response.ret + ", " + response.msg);
        return null;
    }

    var album_names = [];
    for (var index = 0; index < response.album_list.length; index++) {
        album_names.push(response.album_list[index].album_name);
    }

    return album_names;
};

module.exports.function = GetInputAlbum;
module.exports.GetInputAlbum = GetInputAlbum;