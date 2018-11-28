var BaseUrl = {
    generateBaseUrl: "http://vi.smartnews.qq.com:80/v2/open/article_search?",
}

var categoryR1 = ['必读', '热点', '要闻', '头条', '最新'];
var categoryR2 = ['国内', '国外'];

module.exports = {
    BaseUrl: BaseUrl,
    categoryR1: categoryR1,
    categoryR2: categoryR2,
    getTimeStamp: getTimeStamp,
    getArticalSearchBody: getArticalSearchBody,
    generateSign: generateSign,
    generateQueryUrl: generateQueryUrl,
    createNews: createNews,
    getCurrentLocation: getCurrentLocation,
    getIndexOfArray: getIndexOfArray,
    getFromTime: getFromTime,
    getUserId: getUserId,
    hanziConvrtToUnicode: hanziConvrtToUnicode,
    timeStampToDateFormat: timeStampToDateFormat
}

function getTimeStamp() {
    return Math.floor((dates.ZonedDateTime.now("UTC").getMillisFromEpoch()) / 1000) + "";
}

function getFromTime(dateTime) {
    console.log("year is " + dateTime.year + ",month is " + dateTime.month + ",day is " + dateTime.day);
    return Math.floor((dates.ZonedDateTime.of(dateTime.year, dateTime.month, dateTime.day, 0, 0, 0, 0).getMillisFromEpoch()) / 1000) + "";
}

function getArticalSearchBody(newsCategory, dateTime, person, srcFrom, location, keywords, searchOption, $vivContext) {
    var userId = "1111111";
    var from_time = "";
    var end_time = "";

    if (newsCategory != undefined) {
        newsCategory = hanziConvrtToUnicode(newsCategory);
    }
    if (person != undefined) {
        person = hanziConvrtToUnicode(person);
    }
    if (location != undefined) {
        location = hanziConvrtToUnicode(location);
    }
    if (keywords != undefined) {
        keywords = hanziConvrtToUnicode(keywords);
    }
    if (srcFrom != undefined) {
        srcFrom = hanziConvrtToUnicode(srcFrom);
    }
    if (dateTime != undefined) {
        // dateTime = hanziConvrtToUnicode(dateTime);
        from_time = getFromTime(dateTime);
        console.log("from_time is " + from_time)
        end_time = getTimeStamp();
        console.log("end_time is " + end_time)
    }

    if ($vivContext && $vivContext.userId) {
        userId = getUserId($vivContext.userId);
    }

    var query = { "uid": userId, "qid": "2222", "raw_query": "test", "req_num": "10", "res_from_time": from_time, "res_end_time": end_time, "query_info": { "news_category": (newsCategory != undefined) ? newsCategory : "", "date_time": "", "person": (person != undefined) ? person : "", "location": (location != undefined) ? location : "", "keywords": (keywords != undefined) ? keywords : "", "srcfrom": (srcFrom != undefined) ? srcFrom : "" } };

    query = JSON.stringify(query).replace(/\\u/g, '\u');
    return query;
}

function generateSign(category, dateTime, person, from, location, keywords, searchOption, $vivContext) {
    var query = getArticalSearchBody(category, dateTime, person, from, location, keywords, searchOption, $vivContext);
    var md5s = config.get("news.appid") + config.get("news.appSecret") + query + getTimeStamp();
    return md5.generate(md5s);
}

function generateQueryUrl() {
    this.params = [];
    this.objectParams = {};
    this.append = function(paramName, paramValue, isEncoded) {
        if (!paramValue) {
            return this;
        }

        if (this.params.length > 0) {
            this.params.push("&");
        }

        if (isEncoded) {
            this.params.push(encodeURIComponent(paramName));
            this.params.push("=");
            this.params.push(encodeURIComponent(paramValue));
        } else {
            this.params.push(paramName);
            this.params.push("=");
            this.params.push(paramValue);
        }
        this.objectParams[paramName] = paramValue;
    }
    return this;
}

generateQueryUrl.prototype.getQuery = function(isPost) {
    if (isPost) {
        return this.objectParams;
    }
    return this.params.join("");
}

function createNews(result) {
    var url = '';
    var zonedDateTime = timeStampToDateFormat(result.pubtime);

    console.log(result)
    if (result.url_set != undefined && result.url_set.doc_url_list != undefined) {
        url = result.url_set.doc_url_list[1].url;
    }

    var news = {
        docid: result.docid,
        srcfrom: result.srcfrom,
        pubtime: zonedDateTime,
        title: result.title,
        cate1: result.cate1,
        cate2: (result.cate2 == undefined) ? "" : result.cate2,
        absS: result.abs_s,
        absM: result.abs_m,
        absL: result.abs_l,
        voiceSummary: result.voice_summary,
        shortcut: result.shortcut,
        newsUrl: url
    }
    return news;
}

function isChinese(str) {
    var returnValue;
    if (/^[\u4E00-\u9FFF]+$/.test(str)) {
        returnValue = true;
    } else {
        returnValue = false;
    }
    return returnValue;
}

//汉字转unicode  
function hanziConvrtToUnicode(data) {
    var str = '';

    for (var i = 0; i < data.length; i++) {
        if (!isChinese(data[i])) {
            str += data[i]
        } else {
            str += "\\u" + parseInt(data[i].charCodeAt(0), 10).toString(16);
        }
    }
    return str;
}

function timeStampToDateFormat(timestamp) {
    var Y;
    var M;
    var D;
    var date = new dates.ZonedDateTime("UTC+08:00", timestamp * 1000);
    var year = dates.ZonedDateTime.now()._internals.dateTime.date.year;
    var dateYear = date.getYear()
    var dateMonth = date.getMonth()
    var dateDay = date.getDay()

    Y = dateYear + '-';
    if (dateMonth < 10) {
        M = '0' + dateMonth;
    } else {
        M = dateMonth;
    }

    if (dateDay < 10) {
        D = '0' + dateDay;
    } else {
        D = dateDay;
    }

    //if (year != dateYear) {
    return Y + M + '-' + D;
    // } else {
    //     return M + '-' + D;
    // }
}

function getCurrentLocation(currentL) {
    var currentLocation;
    //geo.GeocodedAddress
    if (currentL != undefined) {
        currentLocation = currentL.levelOne.name.substr(0, 2);
        if (currentLocation == "北京" || currentLocation == "天津" || currentLocation == "重庆" || currentLocation == "上海") {
            return currentLocation;
        } else {
            return currentL.levelTwo;
        }
    }
    return currentLocation;
}

function getUserId(id) {
    var idStr = id.toString()
    var startIndex = idStr.indexOf(':') + 1
    var endIndex = idStr.length
    idStr = idStr.substring(startIndex, endIndex)
    return idStr
}

function getIndexOfArray(val, array) {
    //console.log(array)
    for (var i = 0; i < array.length; i++) {
        if (array[i] == val) return i;
    }
    return -1;
}