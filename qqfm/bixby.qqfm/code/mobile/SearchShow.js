var base = require("../lib/base");
var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");

function searchShowInternal(show_name, params, $vivContext) {
    var nullBigResult = {
        searchShowResult: {}
    };
    var inputParams = {
        deviceid: base.getUserId($vivContext.userId),
        appid: config.get("qqfm.appid"),
        search_type: "show",
        search_word: (show_name instanceof Array) ? show_name.join("") : show_name
    };

    inputParams.pagination_cursor = 0;
    inputParams.pagination_size = 30;

    if (params) {
        if (params.pagination_cursor) {
            inputParams.pagination_cursor = params.pagination_cursor;
        }

        if (params.pagination_size) {
            inputParams.pagination_size = params.pagination_size;
        }
    }

    console.log("搜索节目:" + inputParams);
    var response = httpRequest.search(inputParams);

    if (response.ret != '0') {
        console.log("failed to searchShowInternal, " + response.ret + ", " + response.msg);
        return nullBigResult;
    }

    var bigResult = {};
    bigResult.searchShowResult = {
        isRecommonded: false,
        search_word: inputParams.search_word,
        has_more: response.has_more,
        pagination_cursor: response.pagination_cursor,
        pagination_size: response.pagination_size,
        show_list: response.show_list ? response.show_list.map(lib.mapToShow) : []
    };

    console.log("searchShowInternal, bigResult:" + JSON.stringify(bigResult));
    return bigResult;
}

function searchShow(show_name, $vivContext) {
    return searchShowInternal(show_name, {}, $vivContext);
}

module.exports.function = searchShow;
module.exports.searchShowInternal = searchShowInternal;
module.exports.searchShow = searchShow;