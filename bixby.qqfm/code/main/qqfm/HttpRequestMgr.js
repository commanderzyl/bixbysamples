var HttpClient = require("./http/HttpClient");
var ConfigMgr = require("./config/ConfigMgr");
var CryptoJS = require("./lib/brix-crypto-js/crypto-js");
var FakeHttpResponseData = require("./http/FakeHttpResponseData");
var MyDate = require("./lib/DateLib");
var Album = require("../qqfm/schema/Album");
var Singer = require("../qqfm/schema/Singer");
var SingerAlbum = require("../qqfm/schema/SingerAlbum");
var SearchedSinger = require("../qqfm/schema/SearchedSinger");
var Show = require("../qqfm/schema/Show");
var SearchedResult = require("../qqfm/schema/SearchedResult");

/**
 * 负责企鹅FM的http请求,建议单例模式下使用
 */
function HttpRequestMgr() {
    this.httpClient = new HttpClient;
}

/**
 * 获取单例对象
 * @returns {HttpRequestMgr} 单例对象
 */
HttpRequestMgr.getInstance = function() {
    if (HttpRequestMgr.instance) {
        return HttpRequestMgr.instance;
    }

    HttpRequestMgr.instance = new HttpRequestMgr();
    return HttpRequestMgr.instance;
}

/**
 * 获取某个分类下的专辑列表
 * @param {Category} category 分类对象
 * @param {Object} params 分页参数
 * @returns {Array<Album>} 专辑列表
 */
HttpRequestMgr.prototype.getAlbumList = function(category, params) {
    var albumList = null;
    if (this.httpClient.disabled()) {
        albumList = FakeHttpResponseData.getAlbumList();
    } else {
        //从config对象中获取请求url, 设置请求参数，然后获取结果即可
        var configMgr = ConfigMgr.getInstance();
        var uri = "/v1/category/get_album_list";
        var url = configMgr.getUrl() + uri;
        var query = {
            category_id: parseInt(category.getId()),
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId(),
            pagination_cursor: (params && params.pagination_cursor) ? params.pagination_cursor : 0,
            pagination_size: (params && params.pagination_size) ? params.pagination_size : 30

        };

        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to getAlbumList, " + response.ret + ", " + response.msg);
            return null;
        }

        albumList = response.album_list;
    }

    // 得到专辑列表后，生成对应的Array<Album>
    var arrayList = [];
    for (var index = 0; index < albumList.length; index++) {
        arrayList.push(new Album(albumList[index]));
    }
    return arrayList;
};

/**
 * 以下接口负责搜索，搜索关键字相关主播/专辑/节目/广播
 * api文档如下所示：
 * 搜索主播/专辑/节目信息（/v1/search/search）
        接口说明： 搜索关键字相关主播/专辑/节目
        参数要求: search_type (搜索类型：singer/album/show/broadcast) search_word (搜索关键字)
        是否分页：是
        请求示例:
            搜专辑：
            Request URL:http://api.fm.qq.com/v1/search/search?search_type=album&search_word=%E9%83%AD%E5%BE%B7%E7%BA%B2&appid=...&sig=YVzDuaW6sFtrEJiVtpx5yyr3nq4%3D
            Request Method:GET
 */
/**
 * 搜索专辑
 * @param {string} searchWord 关键词
 * @returns {Array<Album>} 专辑列表
 */
HttpRequestMgr.prototype.searchAlbum = function(searchWord) {
    var albumList = null;
    if (this.httpClient.disabled()) {
        albumList = FakeHttpResponseData.getAlbumList();
    } else {
        //从config对象中获取请求url, 设置请求参数，然后获取结果即可
        albumList = search.call(this, "album", searchWord);
    }

    // 得到专辑列表后，生成对应的Array<Album>
    var arrayList = [];
    for (var index = 0; index < albumList.length; index++) {
        arrayList.push(new Album(albumList[index]));
    }
    return arrayList;
};

/**
 * 搜索主播
 * @param {string} searchWord 关键词
 * @param {object} params 分页参数, 格式如下：
 * {
 *  pagination_cursor: 0, 
 *  pagination_size: 30,//最大30
 * }
 * @returns {Array<SearchedResult>} 主播列表
 * 
 */
HttpRequestMgr.prototype.searchSinger = function(searchWord, params) {
    var searchedResult = null;
    if (this.httpClient.disabled()) {
        singerList = FakeHttpResponseData.getSingerList();
    } else {
        //从config对象中获取请求url, 设置请求参数，然后获取结果即可
        searchedResult = search.call(this, "singer", searchWord, params);
    }

    return searchedResult;
};

/**
 * 搜索节目列表
 * @param {string} searchWord 关键词
 * @returns {Array<Show>} 节目列表
 */
HttpRequestMgr.prototype.searchShow = function(searchWord) {
    var showList = null;
    if (this.httpClient.disabled()) {
        showList = FakeHttpResponseData.getShowList();
    } else {
        //从config对象中获取请求url, 设置请求参数，然后获取结果即可
        showList = search.call(this, "show", searchWord);
    }

    // 得到专辑列表后，生成对应的Array<Show>
    var arrayList = [];
    for (var index = 0; index < showList.length; index++) {
        arrayList.push(new Show(showList[index]));
    }
    return arrayList;
};

/**
 * 搜索广播电台
 * @param {string} searchWord 关键词
 * @returns {Array<Broadcast>} 广播电台列表
 */
HttpRequestMgr.prototype.searchBroadcast = function(searchWord) {
    return null;
}

function search(searchType, searchWord, params) {
    //从config对象中获取请求url, 设置请求参数，然后获取结果即可
    var configMgr = ConfigMgr.getInstance();
    var uri = "/v1/search/search";
    var url = configMgr.getUrl() + uri;
    var query = {
        search_type: searchType,
        search_word: searchWord,
        appid: configMgr.getAppId(),
        deviceid: configMgr.getDeviceId(),
        pagination_cursor: (params && params.pagination_cursor) ? params.pagination_cursor : 0,
        pagination_size: (params && params.pagination_size) ? params.pagination_size : 30
    };

    var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to getAlbumList, " + response.ret + ", " + response.msg);
        return null;
    }

    // switch (searchType) {
    //     case "album":
    //         return response.album_list;
    //     case "show":
    //         return response.show_list;
    //     case "singer":
    //         return response.user_list;
    //     case "broadcast":
    //         return response.broadcast_list;
    // }
    return new SearchedResult(response);
}

/**
 * 获取最新更新的专辑, 从接口返回的结果看，只支持1小时范围内的查询
 * @param {Object} params 参数列表，格式如下.如果参数为空，则取距当前时间1小时以内的专辑
 * {
        timestamp_start 起始时间戳
        timestamp_end 结束时间戳
        order item排序顺序默认正序 ,为0倒叙
        filter_charge 是否过滤付费专辑，默认拉全部 0 全部（免费+试听收费） 1 拉取免费专辑 2 拉取授权的收费专辑
        is_offline 0 拉取有更新的上架专辑 1 拉取下架专辑
        category_id   支持按照分类筛选，默认全部分类
    }
    @returns {Array<Album>} 专辑列表
 */
HttpRequestMgr.prototype.getRecentAlbum = function(params) {
    var albumList = null;
    if (this.httpClient.disabled()) {
        albumList = FakeHttpResponseData.getRecentAlbumList();
    } else {
        var configMgr = ConfigMgr.getInstance();
        var query = {
            timestamp_start: params ? params.timestamp_start : undefined,
            timestamp_end: params ? params.timestamp_end : undefined,
            order: 0,
            filter_charge: 0,
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId(),
            pagination_size: 30
        };

        if (!params || !params.timestamp_start) {
            query.timestamp_end = (new MyDate).getCurrentMilliseconds();
            query.timestamp_start = query.timestamp_end - 3600;
        }

        var uri = "/v1/update/get_recent_album_list";
        var url = configMgr.getUrl() + uri;
        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to get_recent_album_list, " + response.ret + ", " + response.msg);
            return null;
        }

        albumList = response.album_list;
    }

    // 得到专辑列表后，生成对应的Array<Album>
    var arrayList = [];
    for (var index = 0; index < albumList.length; index++) {
        arrayList.push(new Album(albumList[index]));
    }
    return arrayList;
};

/**
 * 获取最新更新的节目, 从接口返回的结果看，只支持1小时范围内的查询
 * @param {Object} params 参数列表，格式如下.如果参数为空，则取距当前时间1小时以内的节目
 * {
        timestamp_start 起始时间戳
        timestamp_end 结束时间戳
        order item排序顺序默认正序 ,为0倒叙
        filter_charge 是否过滤付费专辑，默认拉全部 0 全部（免费+试听收费） 1 拉取免费专辑 2 拉取授权的收费专辑
        is_offline 0 拉取有更新的上架专辑 1 拉取下架专辑
        category_id 支持按照分类筛选，默认全部分类
    }
    @returns {Array<Show>} 节目列表
 */
HttpRequestMgr.prototype.getRecentShow = function(params) {
    var showList = null;
    if (this.httpClient.disabled()) {
        showList = FakeHttpResponseData.getRecentShowList();
    } else {
        var configMgr = ConfigMgr.getInstance();
        var query = {
            timestamp_start: params ? params.timestamp_start : undefined,
            timestamp_end: params ? params.timestamp_end : undefined,
            order: 0,
            filter_charge: 0,
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId(),
            pagination_size: 30
        };

        if (!params || !params.timestamp_start) {
            query.timestamp_end = (new MyDate).getCurrentMilliseconds();
            query.timestamp_start = query.timestamp_end - 3600;
        }

        var uri = "/v1/update/get_recent_show_list";
        var url = configMgr.getUrl() + uri;
        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to get_recent_show_list, " + response.ret + ", " + response.msg);
            return null;
        }

        showList = response.show_list;
    }

    // 得到专辑列表后，生成对应的Array<Show>
    var arrayList = [];
    for (var index = 0; index < showList.length; index++) {
        arrayList.push(new Show(showList[index]));
    }
    return arrayList;
};

/**
 * 根据节目id获取节目详情
 * @param {string} showId 节目ID
 * @returns {Show} 节目详情
 */
HttpRequestMgr.prototype.getShow = function(showId) {
    var show = null;
    if (this.httpClient.disabled()) {
        show = FakeHttpResponseData.getRecentShowList()[0];
        show.play_url = {
            "high": "http://ws.stream.fm.qq.com/R396003Po0yb4LRFuK.m4a?fromtag=36&guid=1541492522&vkey=B2BB889129C0C98F314D31B1EEB8E65D46FE87141169D977444FF92B07A7CC94047268BA92B1E6FA37D44BF50BD9B0202DB880AC4ADFBD1D",
            "high_file_size": 3308423,
            "medium": "http://ws.stream.fm.qq.com/R348003Po0yb4LRFuK.m4a?fromtag=36&guid=1541492522&vkey=B2BB889129C0C98F314D31B1EEB8E65D46FE87141169D977444FF92B07A7CC94047268BA92B1E6FA37D44BF50BD9B0202DB880AC4ADFBD1D",
            "medium_file_size": 1998130,
            "small": "http://ws.stream.fm.qq.com/R348003Po0yb4LRFuK.m4a?fromtag=36&guid=1541492522&vkey=B2BB889129C0C98F314D31B1EEB8E65D46FE87141169D977444FF92B07A7CC94047268BA92B1E6FA37D44BF50BD9B0202DB880AC4ADFBD1D",
            "small_file_size": 1998130
        };
    } else {
        var configMgr = ConfigMgr.getInstance();
        var query = {
            show_id: showId,
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId()
        };

        var uri = "/v1/detail/get_show_info";
        var url = configMgr.getUrl() + uri;
        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to get_show_info, " + response.ret + ", " + response.msg);
            return null;
        }

        show = response.show_info;
        show.h5_url = response.h5_url;
        show.play_url = response.play_url;
    }

    return new Show(show);
};

/**
 * 根据节目ids获取节目详情
 * @param {string} showIds 节目IDs,格式为showIds = ID1,ID2...
 * @returns {Array<Show>} 节目详情
 */
HttpRequestMgr.prototype.getShows = function(showIds) {
    var showList = null;
    if (this.httpClient.disabled()) {
        showList = FakeHttpResponseData.getRecentShowList();
    } else {
        var configMgr = ConfigMgr.getInstance();
        var query = {
            show_id: showId,
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId()
        };

        var uri = "/v1/detail/get_show_info";
        var url = configMgr.getUrl() + uri;
        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to get_show_info, " + response.ret + ", " + response.msg);
            return null;
        }

        showList = response.show_list;
    }

    if (showList.length == 0) {
        return null;
    }

    // 得到节目列表后，生成对应的Array<Show>
    var arrayList = [];
    for (var index = 0; index < showList.length; index++) {
        showList[index].show_info.h5_url = showList[index].h5_url;
        showList[index].show_info.play_url = showList[index].play_url;
        arrayList.push(new Show(showList[index].show_info));
    }
    return arrayList;
};

/**
 * 获取某个专辑下的节目信息列表
 * @param {string} albumID 专辑ID
 * @param {object} params 分页参数
 * {
 *  pagination_cursor: 0, 
 *  pagination_size: 30,//最大30
 * }
 * @returns {Array<Show>} 节目列表
 */
HttpRequestMgr.prototype.getAlbumShowList = function(albumID, params) {
    var showList = null;
    if (this.httpClient.disabled()) {
        showList = FakeHttpResponseData.getRecentAlbumList();
    } else {
        var configMgr = ConfigMgr.getInstance();
        var query = {
            album_id: albumID,
            appid: configMgr.getAppId(),
            deviceid: configMgr.getDeviceId(),
            pagination_cursor: (params && params.pagination_cursor) ? params.pagination_cursor : 0,
            pagination_size: (params && params.pagination_size) ? params.pagination_size : 30

        };

        var uri = "/v1/detail/get_album_show_list";
        var url = configMgr.getUrl() + uri;
        var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
            format: "json"
        });

        if (!checkStatusCode(response)) {
            console.log("failed to get_album_show_list, " + response.ret + ", " + response.msg);
            return null;
        }

        showList = response.show_list;

    }

    if (showList.length == 0) {
        return null;
    }

    // 得到节目列表后，生成对应的Array<Show>
    var arrayList = [];
    for (var index = 0; index < showList.length; index++) {
        arrayList.push(new Show(showList[index]));
    }
    return arrayList;
};

/**
 * 获取主播下面的专辑列表
 * @param {SearchedSinger} searchedSinger 主播
 * @param {object} params 分页对象
 * @return {Array<SingerAlbum>} 专辑数组
 */
HttpRequestMgr.prototype.getSingerAlbumList = function(searchedSinger, params) {
    var configMgr = ConfigMgr.getInstance();
    var query = {
        anchor_id: searchedSinger.getId(),
        appid: configMgr.getAppId(),
        deviceid: configMgr.getDeviceId(),
        pagination_cursor: (params && params.pagination_cursor) ? params.pagination_cursor : 0,
        pagination_size: (params && params.pagination_size) ? params.pagination_size : 30
    };

    var uri = "/v1/detail/get_singer_album_list";
    var url = configMgr.getUrl() + uri;
    var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to get_singer_album_list, " + response.ret + ", " + response.msg);
        return null;
    }

    var albumList = response.album_list;
    var albumArray = [];
    for (var index = 0; index < albumList.length; index++) {
        albumArray.push(new SingerAlbum(albumList[index]));
    }
    return albumArray;
}

/**
 * 获取某个主播下面最新的专辑
 * @param {SearchedSinger} searchedSinger
 * @returns {SingerAlbum} 最新的专辑
 */
HttpRequestMgr.prototype.getRecentSingerAlbum = function(searchedSinger) {
    if (this.httpClient.disabled()) {
        return null;
    }

    var configMgr = ConfigMgr.getInstance();
    var query = {
        anchor_id: searchedSinger.getId(),
        appid: configMgr.getAppId(),
        deviceid: configMgr.getDeviceId(),
        pagination_size: 30
    };

    var uri = "/v1/detail/get_singer_album_list";
    var url = configMgr.getUrl() + uri;
    var response = this.httpClient.getUrl(url + "?" + buildQueryUrl(uri, query), {
        format: "json"
    });

    if (!checkStatusCode(response)) {
        console.log("failed to get_singer_album_list, " + response.ret + ", " + response.msg);
        return null;
    }

    var albumList = response.album_list;
    var maxUpdateTimeIndex = 0;
    var maxUPdateTime = 0;
    for (var index = 0; index < albumList.length; index++) {
        if (maxUPdateTime < albumList[index].album_update_timestamp) {
            maxUPdateTime = albumList[index].album_update_timestamp;
            maxUpdateTimeIndex = index;
        }
    }

    var album = null;
    if (maxUpdateTimeIndex < albumList.length) {
        album = new SingerAlbum(albumList[maxUpdateTimeIndex]);
    }
    return album;
}

/**
 * 检查返回的数据是否正确
 * @param {string} response 响应体
 * @returns {boolean} true 成功，false 失败
 */
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
    var appkey = ConfigMgr.getInstance().getAppKey();

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

    // var encrypStr = SHA1.b64_hmac_sha1(appkey, propString);
    // console.log("HMAC-SHA1加密, appkey = " + appkey + ", 加密后: " + encrypStr);
    // // 7. 进行Base64编码
    // var MyBase64;
    // try {
    //     MyBase64 = base64 ? base64 : new Base64;
    // } catch (err) {
    //     MyBase64 = new Base64;
    // }

    // var sig = MyBase64.encode(encrypStr);
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

function test() {
    var uri = "/v1/category/get_album_list";
    var query = {
        category_id: 39137,
        appid: "experience",
        deviceid: "352983094892511",
        pagination_size: 30
    };
    //期望结果
    //sig=%2FP0MSmnfUs4WTvkofXl8O%2FCVRCU%3D
    var queryStr = buildQueryUrl(uri, query);
    console.log("test: queryStr = " + queryStr);
}
//test();
module && (module.exports = HttpRequestMgr);