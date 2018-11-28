var SearchedSinger = require("./SearchedSinger");
/**
 * 用来保存/v1/search/search接口返回的结果
 */
function SearchedResult(responseJson) {
    this.responseJson = responseJson;
}

/**
 * 是否还有更多搜索结果.
 * @returns {boolean} true 还有更多搜索结果，false 没有
 */
SearchedResult.prototype.hasMoreResult = function() {
    return this.responseJson.has_more == 0;
};

/**
 * 获取当前搜索结果的起始游标
 * @returns {string} 起始游标
 */
SearchedResult.prototype.getPaginationCursor = function() {
    return this.responseJson.pagination_cursor;
};

/**
 * 获取当前搜索类型
 * @returns 返回当前搜索出来的结果类型, INVALID, ALBUM, SHOW, SINGER, BROADCAST
 */
SearchedResult.prototype.getSearchedType = function() {
    if (this.responseJson.album_list) {
        return SearchedResult.SEARCH_TYPE_ALBUM;
    } else if (this.responseJson.show_list) {
        return SearchedResult.SEARCH_TYPE_SHOW;
    } else if (this.responseJson.user_list) {
        return SearchedResult.SEARCH_TYPE_SINGER;
    } else if (this.responseJson.broadcast_list) {
        return SearchedResult.SEARCH_TYPE_BROADCAST;
    } else {
        return SearchedResult.SEARCH_TYPE_INVALID;
    }
};

/**
 * 返回搜索结果，根据类型不同，返回不一样的结果类型
 * @returns {Array<T>} 结果数组，可能是SearchedSinger。。。。
 */
SearchedResult.prototype.getSearchResult = function() {
    if (this.getSearchedType() == SearchedResult.SEARCH_TYPE_SINGER) {
        if (!this.singerList) {
            // 得到主播列表后，生成对应的Array<SearchedSinger>
            var singerList = this.responseJson.user_list;
            var arrayList = [];
            for (var index = 0; index < singerList.length; index++) {
                arrayList.push(new SearchedSinger(singerList[index]));
            }
            this.singerList = arrayList;
            return arrayList;
        } else {
            return this.singerList;
        }
    }
};

SearchedResult.SEARCH_TYPE_INVALID = "invalid";
SearchedResult.SEARCH_TYPE_ALBUM = "album";
SearchedResult.SEARCH_TYPE_SHOW = "show";
SearchedResult.SEARCH_TYPE_SINGER = "singer";
SearchedResult.SEARCH_TYPE_BROADCAST = "broadcast";

module && (module.exports = SearchedResult);