var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");
var SearchShow = require("./SearchShow");

function PlayShow(show_name, show_id, $vivContext) {
    if (show_id) {
        return PlayShowWidthId(show_id, $vivContext);
    } else {
        return PlayShowWithName(show_name, $vivContext);
    }
}

function PlayShowWithName(show_name, $vivContext) {
    var bigResult = SearchShow.searchShow(show_name, $vivContext);

    if (bigResult.searchShowResult && bigResult.searchShowResult.show_list) {
        var show_list = bigResult.searchShowResult.show_list;
        if (show_list.length != 0) {
            return {
                playShowResult: { schema: show_list[0].schema }
            }
        }
    }
    return null;
}

function PlayShowWidthId(show_id, $vivContext) {
    var response = httpRequest.getShowInfo({
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
        show_id: show_id
    });

    if (response && response.schema) {
        return {
            playShowResult: { schema: response.schema }
        }

    }
    return null;
}

module.exports.function = PlayShow;
module.exports.PlayShowWidthId = PlayShowWidthId;