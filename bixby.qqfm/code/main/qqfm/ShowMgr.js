var HttpRequestMgr = require("./HttpRequestMgr");
var Show = require("./schema/Show");
/**
 * 节目对象管理器，建议使用单例模式，如
 * ShowMgr.getInstance();
 */
function ShowMgr() {

}

/**
 * 获取最新更新的节目列表
 * @returns {Array<Show>} 专辑列表
 */
ShowMgr.prototype.getRecentShow = function() {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var showList = httpRequestMgr.getRecentShow();
    if (!showList) {
        console.log("failed to search show list for" + showList);
        return null;
    }

    return showList;
};

/**
 * 根据Id获取节目详情对象
 * @param {string} showId 节目ID
 * @returns {Show} 节目对象
 */
ShowMgr.prototype.getShow = function(showId) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var show = httpRequestMgr.getShow(showId);
    if (!show) {
        console.log("failed to get show for " + showId);
        return null;
    }

    return show;
}

/**
 * 根据Id获取节目详情对象
 * @param {string} showIds 节目IDs show_ids=ID1,ID2...
 * @returns {Array<Show>} 节目对象数组
 */
ShowMgr.prototype.getShows = function(showIds) {
    var httpRequestMgr = HttpRequestMgr.getInstance();
    var showList = httpRequestMgr.getShows(showIds);
    if (!showList) {
        console.log("failed to get show List for " + showIds);
        return null;
    }

    return showList;
}

ShowMgr.getInstance = function() {
    if (ShowMgr.instance) {
        return ShowMgr.instance;
    }

    ShowMgr.instance = new ShowMgr();
    return ShowMgr.instance;
}

module && (module.exports = ShowMgr);