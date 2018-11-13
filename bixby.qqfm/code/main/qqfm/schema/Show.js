/**
 * 节目对象
 * @param {Object} showJson 这是从qq fm 获取的原生
 * json结构对象，形式如下，为了简单起见，我们直接保存起来使用，
 * 可以参考 http://api.fm.qq.com/
 * 不会再单独创建所有的变量了。
 * {
        "belong_album_info": {
            "album_cover": "http://imgcache.qq.com/fm/photo/album/rmid_album_360/l/B/001zEPhg1aLplB.jpg?time=1508849508",
            "album_desc": "把握好语音语调，注意连读、失音、弱化、浊化、同化、重音、缩读等等细节，坚持模仿，你的英语一定越来越好！",
            "album_id": "rd001zEPhg1aLplB",
            "album_is_charge": 0,
            "album_is_collected": 0,
            "album_name": "练习英语口语_模仿",
            "album_owner": {
                "anchor_album_num": 0,
                "anchor_create_timestamp": 1449393252,
                "anchor_desc": "热爱英语，热爱足球",
                "anchor_fans_num": 14,
                "anchor_gender": 1,
                "anchor_id": "8278230",
                "anchor_logo": "http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/P/7/003P94uL0Cr5P7.jpg?time=1449393440",
                "anchor_name": "Jason2015",
                "anchor_show_num": 2
            },
            "album_update_timestamp": 1450081903,
            "category": [
                {
                    "category_id": "39126",
                    "category_name": "知识干货",
                    "level": 1
                },
                {
                    "category_id": "39127",
                    "category_name": "语言学习",
                    "level": 2
                }
            ],
            "h5_url": "http://fm.qzone.qq.com/luobo/radio?_wv=4097&aid=rd001zEPhg1aLplB&jumpapp=0",
            "is_serial": 1,
            "show_num": 2,
            "show_sort_type": 0
        },
        "h5_url": "http://fm.qzone.qq.com/luobo/radio?_wv=4097&aid=rd001zEPhg1aLplB&showid=rd003VMFj83ycYuj&jumpapp=0",
        "play_url": {
            "high": "http://ws.stream.fm.qq.com/R196003VMFj83ycYuj.m4a?fromtag=36&guid=1541475391&vkey=E9E64162432429CD532C0500D5EC78BA1CE30D2C027DEAD5C2846846B2214FD4CBED9211694B39E1E9D81385C087170496FC6690F4C0EDF2",
            "high_file_size": 2107673,
            "medium": "http://ws.stream.fm.qq.com/R148003VMFj83ycYuj.m4a?fromtag=36&guid=1541475391&vkey=E9E64162432429CD532C0500D5EC78BA1CE30D2C027DEAD5C2846846B2214FD4CBED9211694B39E1E9D81385C087170496FC6690F4C0EDF2",
            "medium_file_size": 1272869,
            "small": "http://ws.stream.fm.qq.com/R148003VMFj83ycYuj.m4a?fromtag=36&guid=1541475391&vkey=E9E64162432429CD532C0500D5EC78BA1CE30D2C027DEAD5C2846846B2214FD4CBED9211694B39E1E9D81385C087170496FC6690F4C0EDF2",
            "small_file_size": 1272869
        },
        "show_cover": "http://imgcache.qq.com/fm/photo/programe/rmid_programe_360/u/j/003VMFj83ycYuj.jpg?time=1449478470",
        "show_create_timestamp": 1449478389,
        "show_desc": "Gary Haugen: As founder of International Justice Mission, Gary Haugen fights the chronically neglected global epidemic of violence against the poor.",
        "show_duration": 209,
        "show_id": "rd003VMFj83ycYuj",
        "show_is_charge": 0,
        "show_is_collected": 0,
        "show_name": "TED Speaker Gary Haugen",
        "show_sequence": 1
    }
 */
function Show(showJson) {
    this.showJson = showJson;
}

// 下面可以添加需要的函数, 一定不要直接获取
// 属性值，这样会破坏封装，增加不稳定性，使用成员函数进行封装。
// 比如要获取节目的名字，那就创建如下的方法
/**
 * 获取节目的名字
 * @returns {string} 节目名字
 */
Show.prototype.getName = function() {
    return this.showJson.show_name;
};

/**
 * 获取节目的id
 * @returns {string} 节目id
 */
Show.prototype.getId = function() {
    return this.showJson.show_id;
}

// 获取节目的播放地址
Show.prototype.getPlayUrl = function() {
    if (this.showJson.play_url) {
        return this.showJson.play_url.high;
    } else {
        var ShowMgr = require("../ShowMgr");
        var showMgr = ShowMgr.getInstance();
        var show = showMgr.getShow(this.getId());
        if (show) {
            this.showJson = show.showJson;
            return this.showJson.play_url.high;
        }
        return null;
    }
}

module && (module.exports = Show);