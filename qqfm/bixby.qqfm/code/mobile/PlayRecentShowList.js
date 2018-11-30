var httpRequest = require("../lib/httpRequest");
var lib = require("../lib/lib");
var base = require("../lib/base");
var SearchRecentShowList = require("./SearchRecentShowList");

function PlayRecentShowList(recent, $vivContext) {
    if (!recent) {
        return null;
    }

    var bigResult = SearchRecentShowList.searchRecentShowList(recent, $vivContext);
    bigResult.recentShowListPlayResult = bigResult.recentShowListSearchResult;
    bigResult.recentShowListSearchResult = null;
    console.log("PlayRecentShowList, succeed to get result: " + JSON.stringify(bigResult));
    return bigResult;
}

module.exports.function = PlayRecentShowList;