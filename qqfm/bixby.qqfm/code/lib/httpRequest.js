var CryptoJS = require("./brix-crypto-js/crypto-js");
var base = require("./base");
/**
搜索主播/专辑/节目信息（/v1/search/search）
接口说明： 搜索关键字相关主播/专辑/节目
参数要求: search_type (搜索类型：singer/album/show) search_word (搜索关键字)
是否分页：是
*/
function search(params) {
    console.log("search, params = " + JSON.stringify(params));

    if (!params || !params.search_type ||
        !params.search_word || !params.appid || !params.deviceid) {
        throw new Error("search: params error");
    }

    var uri = config.get("qqfm.search_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to search, " + response.ret + ", " + response.msg);
        return null;
    }

    console.log("success to search: " + JSON.stringify(response));
    return response;
}

/**
获取主播名下专辑（/v1/detail/get_singer_album_list）
接口说明： 获取主播名下专辑
参数要求: anchor_id
是否分页：是
 */
function getSingerAlbumList(params) {
    console.log("getSingerAlbumList, params = " + JSON.stringify(params));
    if (!params || !params.anchor_id || !params.appid || !params.deviceid) {
        throw new Error("getSingerAlbumList: params error");
    }

    var uri = config.get("qqfm.get_singer_album_list_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getSingerAlbumList, " + response.ret + ", " + response.msg);
        return null;
    }

    console.log("success to getSingerAlbumList: " + JSON.stringify(response));
    return response;
}

/**
获取专辑下节目信息列表（/v1/detail/get_album_show_list）
接口说明：
专辑下节目信息列表
参数要求:
album_id 专辑ID
order 专辑下专辑顺序，0默认顺序(可正可逆, FM推荐的顺序) 1正序 2逆序
是否分页：是
 */
function getAlbumShowList(params) {
    console.log("getAlbumShowList, params = " + JSON.stringify(params));
    if (!params || !params.album_id || !params.appid || !params.deviceid) {
        throw new Error("getAlbumShowList: params error");
    }

    var uri = config.get("qqfm.get_album_show_list_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getAlbumShowList, " + response.ret + ", " + response.msg);
        return null;
    }

    console.log("success to getAlbumShowList: " + JSON.stringify(response));
    return response;
}

/**
 * 获取主播名下的所有节目
 */
function getSingerShows(singer, params) {
    console.log("getSingerShows, params = " + JSON.stringify(params) +
        "singer: " + JSON.stringify(singer));
    if (!params || !params.appid || !params.deviceid) {
        throw new Error("getSingerShows: params error");
    }

    // 先判断这个歌手的总节目数量
    var showNum = singer.anchor_show_num;
    var pagination_cursor = 0;
    var pagination_size = 30;
    if (params) {
        if (params.pagination_cursor) {
            pagination_cursor = params.pagination_cursor;
        }

        if (params.pagination_size) {
            pagination_size = params.pagination_size;
        }
    }

    if (pagination_cursor >= showNum) {
        console.log("getSingerShows, 节目游标大于节目总数量 " + pagination_cursor + ", " + showNum);
        return {
            singer: singer,
            show_list: [],
            has_more: 0,
            pagination_cursor: pagination_cursor,
            pagination_size: pagination_size
        };
    }

    var finished = false;
    var curCursor = 0;
    var curPageSize = 0;
    // 需要获取的专辑ID和数量, 存储的内容为
    // {id: , cursor:, size: }
    var targetAlbums = [];
    // 先获取前30个专辑
    var page = {
        pagination_cursor: 0,
        pagination_size: 30
    }

    //设置最多执行的次数为10次
    var requestSingerAlbumListNum = 0;
    var maxRequestForSingerAlbumList = 10;
    while (!finished) {
        console.log("获取专辑列表, " + JSON.stringify(page));
        console.log("anchor_id: " + singer.anchor_id);
        requestSingerAlbumListNum++;
        if (requestSingerAlbumListNum > maxRequestForSingerAlbumList) {
            break;
        }
        var albumListResponse = getSingerAlbumList({
            anchor_id: singer.anchor_id,
            appid: params.appid,
            deviceid: params.deviceid,
            pagination_cursor: page.pagination_cursor,
            pagination_size: page.pagination_size
        });

        var albumList = albumListResponse.album_list;

        if (!albumListResponse || albumListResponse.album_list.length == 0) {
            break;
        }

        for (var index = 0; index < albumList.length; index++) {
            // 当前专辑的节目数量
            curPageSize = albumList[index].show_num;
            // 如果游标位于这个专辑的节目范围内
            if (pagination_cursor < (curCursor + curPageSize)) {
                // 正好获取了所有结果
                if ((pagination_cursor + pagination_size) <= (curCursor + curPageSize)) {
                    targetAlbums.push({
                        id: albumList[index].album_id,
                        cursor: pagination_cursor - curCursor,
                        size: pagination_size
                    });
                    finished = true;
                    break;
                } else {
                    size = curCursor + curPageSize - pagination_cursor;
                    targetAlbums.push({
                        id: albumList[index].album_id,
                        cursor: pagination_cursor - curCursor,
                        size: size
                    });
                    pagination_cursor = curCursor + curPageSize;
                    pagination_size -= size;
                    if (pagination_size <= 0) {
                        finished = true;
                        break;
                    }
                }
            }

            curCursor += curPageSize;
        }

        if (finished) {
            break;
        }

        page.pagination_cursor = curCursor;
    }

    var result = {};
    result.singer = singer;
    result.pagination_cursor = (params && params.pagination_cursor) ? params.pagination_cursor : 0;
    result.show_list = [];
    console.log("targetAlbums: " + JSON.stringify(targetAlbums));
    for (var index = 0; index < targetAlbums.length; index++) {
        var showResponse = getAlbumShowList({
            album_id: targetAlbums[index].id,
            pagination_cursor: targetAlbums[index].cursor,
            pagination_size: targetAlbums[index].size,
            appid: params.appid,
            deviceid: params.deviceid
        });

        if (!showResponse || !showResponse.show_list || showResponse.show_list.length == 0) {
            console.log("failed to get show list");
            continue;
        }

        var showList = showResponse.show_list;
        if (showList) {
            result.show_list = result.show_list.concat(showList);
        }
    }

    result.pagination_size = result.show_list.length;
    if ((result.pagination_cursor + result.pagination_size) < singer.anchor_show_num) {
        result.has_more = 1;
    } else {
        result.has_more = 0;
    }

    console.log("getSingerShows, result = " + JSON.stringify(result));
    return result;
}
/**
某个时间段更新的专辑(/v1/update/get_recent_album_list)
接口说明： 获取在timestamp_start , timestamp_end之间更新的专辑
参数要求:
timestamp_start 起始时间戳
timestamp_end 结束时间戳
order item排序顺序默认正序 ,为0倒叙
filter_charge 是否过滤付费专辑，默认拉全部 0 全部（免费+试听收费） 1 拉取免费专辑 2 拉取授权的收费专辑
is_offline 0 拉取有更新的上架专辑 1 拉取下架专辑
列表项

* category_id   支持按照分类筛选，默认全部分类
*/
function getRecentAlbumList(params) {
    console.log("getRecentAlbumList, params = " + JSON.stringify(params));
    if (!params || !params.appid || !params.deviceid) {
        throw new Error("getRecentAlbumList: params error");
    }

    if (!params.timestamp_start || !params.timestamp_end) {
        //params.timestamp_start = base.getTimeStampOfCurrentDayZeroClock();
        params.timestamp_end = base.getTimeStamp();
        params.timestamp_start = params.timestamp_end - 3600;
    }

    var uri = config.get("qqfm.get_recent_album_list_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getRecentAlbumList, " + response.ret + ", " + response.msg);
        return null;
    }

    response.timestamp_start = params.timestamp_start;
    response.timestamp_end = params.timestamp_end;
    console.log("success to getRecentAlbumList: " + JSON.stringify(response));
    return response;
}
/**
某个时间段内更新的节目(/v1/update/get_recent_show_list)
接口说明： 获取在timestamp_start , timestamp_end之间新增的节目
参数要求:
timestamp_start 起始时间戳
timestamp_end 结束时间戳
order item排序顺序默认正序 ,为0倒叙
filter_charge 是否过滤付费专辑，默认拉全部 0 全部（免费+试听收费） 1 拉取免费专辑 2 拉取授权的收费专辑
is_offline 0 拉取有更新的上架专辑 1 拉取下架专辑
category_id 支持按照分类筛选，默认全部分类
是否分页：是
*/
function getRecentShowList(params) {
    console.log("getRecentShowList, params = " + JSON.stringify(params));
    if (!params || !params.appid || !params.deviceid) {
        throw new Error("getRecentShowList: params error");
    }

    if (!params.timestamp_start || !params.timestamp_end) {
        //params.timestamp_start = base.getTimeStampOfCurrentDayZeroClock();
        params.timestamp_end = base.getTimeStamp();
        params.timestamp_start = params.timestamp_end - 3600;
    }

    var uri = config.get("qqfm.get_recent_show_list_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getRecentShowList, " + response.ret + ", " + response.msg);
        return null;
    }

    response.timestamp_start = params.timestamp_start;
    response.timestamp_end = params.timestamp_end;
    console.log("success to getRecentShowList: " + JSON.stringify(response));
    return response;
}

/**
 * 获取节目详情（/v1/detail/get_show_info）
接口说明：
节目的详细信息
参数要求: show_id (节目ID) 接口支持批量操作show_ids=ID1,ID2 上限30个
是否分页：否
 */
function getShowInfo(params) {
    console.log("getShowInfo, params = " + JSON.stringify(params));
    if (!params || !params.appid || !params.deviceid) {
        throw new Error("getShowInfo: params error");
    }

    if (!params.show_id && !params.show_ids) {
        throw new Error("getShowInfo: params error, must have show_id or show_ids");
    }

    var uri = config.get("qqfm.get_show_info_path");
    var url = config.get("qqfm.host") + uri;
    var response = http.getUrl(url + "?" + buildQueryUrl(uri, params), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getShowInfo, " + response.ret + ", " + response.msg);
        return null;
    }

    console.log("success to getShowInfo: " + JSON.stringify(response));
    return response;
}

function checkStatusCode(response) {
    return response.ret == '0';
}

/**
 * 根据query对象，生成一个query字符串
 * @param {string} uri URI路径
 * @param {Object} query 查询参数对象
 * @returns {string} 查询参数组成的字符串
 */
function buildQueryUrl(uri, query) {
    var appkey = config.get("qqfm.appkey");

    // 以下步骤是为了生成sig参数
    // 1. encode URI
    uri = encodeURIComponent(uri);

    // 2. 将所有参数按升序排序    
    var propList = [];
    for (var prop in query) {
        propList.push(prop);
    }
    propList.sort();

    // 3. 将第2步中排序后的参数(key=value)用&拼接起来, 然后进行URL编码
    var propString = "";
    for (var index = 0; index < propList.length; index++) {
        propString += propList[index] + "=" + query[propList[index]] + "&";
    }
    propString = encodeURIComponent(propString.substring(0, propString.length - 1));

    // 4. 将HTTP请求方式，第1步以及第3步中的到的字符串用&拼接起来，得到源串
    propString = "GET&" + uri + "&" + propString;
    console.log("请求源串:" + propString);

    // 5. 构造密钥
    appkey += "&";

    // 以下进行签名生成
    // 6. 使用HMAC-SHA1加密算法，使用第5步中得到的密钥对4中得到的源串加密
    var hash = CryptoJS.HmacSHA1(propString, appkey);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

    var sig = hashInBase64;

    query.sig = encodeURIComponent(sig);

    // 把query变成一个字符串
    var queryStr = "";
    for (var key in query) {
        queryStr += key + "=" + query[key] + "&";
    }
    queryStr = queryStr.substring(0, queryStr.length - 1);
    console.log("buildQueryUrl: " + queryStr);
    return queryStr;
}

module.exports = {
    search: search,
    getSingerAlbumList: getSingerAlbumList,
    getSingerShows: getSingerShows,
    getRecentAlbumList: getRecentAlbumList,
    getShowInfo: getShowInfo,
    getAlbumShowList: getAlbumShowList,
    getRecentShowList: getRecentShowList
};