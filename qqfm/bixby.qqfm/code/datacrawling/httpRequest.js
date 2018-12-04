/**
 * 使用node js实现的发起网络请求的库
 */

//var http = require('http');
var CryptoJS = require("../lib/brix-crypto-js/crypto-js");
// var sync = require('xd-synchttp');
var sync = require('sync-request');
var host = "http://api.fm.qq.com";


function getCategoryList(params) {
    //console.log("getCategoryList, params: " + JSON.stringify(params));

    var uri = "/v1/category/get_category_list";
    var url = host + uri;
    var response = sendHttpRequest(url + "?" + buildQueryUrl(uri, params));
    return response;
}

function getCategoryAlbumList(params) {
    //console.log("getCategoryAlbumList, params: " + JSON.stringify(params));

    var uri = "/v1/category/get_album_list";
    var url = host + uri;
    var response = sendHttpRequest(url + "?" + buildQueryUrl(uri, params));
    return response;
}

/**
 * http模块发送请求
 * @param host
 * @param port
 * @param route
 * @param params 参数
 * @param headers
 * @param encoding 可选值： utf8 binary
 */
function sendHttpRequest(url) {
    var res = sync('GET', url);
    // console.log(res.getBody().toString());
    try {
        const parsedData = JSON.parse(res.getBody());
        //console.log(parsedData);
        return parsedData;
    } catch (e) {
        console.error(e.message);
    }
    return null;
}

function test3(url) {
    
    var res = sync('GET', 'http://api.fm.qq.com/v1/detail/get_singer_album_list?deviceid=samsung-2gkg80yrym&appid=1107924367&anchor_id=42247444&sig=P3zjEM9I4Bzs9o0prrw6OyC1Mkg%3D');
    console.log(res.getBody().toString());
    try {
        const parsedData = JSON.parse(res.getBody());
        console.log(parsedData);
        return parsedData;
    } catch (e) {
        console.error(e.message);
    }
    return null;
}
// test3();
 
// 请求例子
function test2() {
    // var res = yield sendHttpRequest("");
    // console.log("test2: res:" + res);
}
function test() {
    http.get('http://api.fm.qq.com/v1/category/get_category_list?category_id=0&appid=...&sig=mrXyAD7FNAt4T5YhVH0HhZtql9M%3D', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('请求失败\n' +
                        `状态码: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error('非法的 content-type.\n' +
                        `期望的是 application/json 但接收到的是 ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        // 消费响应的数据以释放内存。
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
        } catch (e) {
            console.error(e.message);
        }
    });
    }).on('error', (e) => {
        console.error(`报错: ${e.message}`);
    });
}

/**
 * 根据query对象，生成一个query字符串
 * @param {string} uri URI路径
 * @param {Object} query 查询参数对象
 * @returns {string} 查询参数组成的字符串
 */
function buildQueryUrl(uri, query) {    
    var appkey="WHS2VMN1SMm98gUF";

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
    //console.log("请求源串:" + propString);

    // 5. 构造密钥
    appkey += "&";

    // 以下进行签名生成
    // 6. 使用HMAC-SHA1加密算法，使用第5步中得到的密钥对4中得到的源串加密
    var hash = CryptoJS.HmacSHA1(propString, appkey);
    //console.log("hash = " + hash);
    var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);

    var sig = hashInBase64;

    //console.log("sig = " + sig);
    query.sig = encodeURIComponent(sig);

    // 把query变成一个字符串
    var queryStr = "";
    for (var key in query) {
        queryStr += key + "=" + query[key] + "&";
    }
    queryStr = queryStr.substring(0, queryStr.length - 1);
    //console.log("buildQueryUrl: " + queryStr);
    return queryStr;
}

function testBuild() {
    getCategoryList({
        category_id: 0,
        appid: "1107924367",
        deviceid: "samsung-device-model1"
    });
    getCategoryList({
        category_id: 0,
        appid: "1107924367",
        deviceid: "samsung-device-model1"
    });
}
//testBuild();

// test2();
module.exports.getCategoryList = getCategoryList;
module.exports.getCategoryAlbumList = getCategoryAlbumList;