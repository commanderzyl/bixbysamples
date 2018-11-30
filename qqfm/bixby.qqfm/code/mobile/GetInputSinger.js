var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function GetInputSinger(search_word, $vivContext) {
    var params = {};
    //首先设置deviceID
    params.deviceid = base.getUserId($vivContext.userId);
    params.appid = config.get("qqfm.appid");
    params.search_type = "singer";
    params.search_word = search_word;
    params.pagination_cursor = 0;
    params.pagination_size = 30;

    console.log("搜索主播:" + params);
    var response = httpRequest.search(params);

    if (response.ret != '0') {
        console.log("failed to SearchSinger, " + response.ret + ", " + response.msg);
        return null;
    }

    return response.user_list.map(lib.mapToSinger);
};

module.exports.function = GetInputSinger;
module.exports.GetInputSinger = GetInputSinger;