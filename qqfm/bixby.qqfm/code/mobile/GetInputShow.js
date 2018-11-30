var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function GetInputShow(search_word, $vivContext) {
    var params = {};
    //首先设置deviceID
    params.deviceid = base.getUserId($vivContext.userId);
    params.appid = config.get("qqfm.appid");
    params.search_type = "show";
    params.search_word = search_word;
    params.pagination_cursor = 0;
    params.pagination_size = 30;

    console.log("搜索节目:" + params);
    var response = httpRequest.search(params);

    if (response.ret != '0') {
        console.log("failed to GetInputShow, " + response.ret + ", " + response.msg);
        return null;
    }

    var show_names = [];
    for (var index = 0; index < response.show_list.length; index++) {
        show_names.push(response.show_list[index].show_name);
    }

    return show_names;
};

module.exports.function = GetInputShow;
module.exports.GetInputShow = GetInputShow;