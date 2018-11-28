/**
 * 使用/v1/search/search?search_type=singer&search_word=郭德纲&appid=experience&deviceid=352983094892511获取的主播对象
 * @param {Object} singerJson 这是从qq fm 获取的原生
 * json结构对象，形式如下，为了简单起见，我们直接保存起来使用，
 * 可以参考 http://api.fm.qq.com/
 * 不会再单独创建所有的变量了。
 * {
        "anchor_album_num":34,
        "anchor_create_timestamp":1492757789,
        "anchor_desc":"郭德纲，1973年生于天津，自幼酷爱民间艺术。8岁投身艺坛，先拜评书前辈高庆海学习评书，后曾跟随相声名家常宝丰学相声，曾受到多位相声名家的指点、传授。其间又潜心学习了京剧、评剧、河北梆子等姊妹剧种，辗转于梨园，兼工文丑与铜锤行当的经历，对丰富自己的相声表演起了十分重要的作用。通过对多种艺术形式的借鉴，逐渐地形成了自己的表演风格。2005年底，在网络与媒体的相互作用之下，郭德纲借势风云突起，凭借着自己多年的磨打锤炼，一跃成为现今相声界年轻演员之中的佼佼者之一。 是相声世家侯耀文的弟子。",
        "anchor_fans_num":115087,
        "anchor_gender":0,
        "anchor_id":"150882",
        "anchor_logo":"http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/e/p/002sLf3n3vr9ep.jpg?time=1429086104",
        "anchor_name":"郭德纲",
        "anchor_show_num":435
    }
 */
function SearchedSinger(singerJson) {
    this.singerJson = singerJson;
}

// 下面可以添加需要的函数, 一定不要直接获取
// 属性值，这样会破坏封装，增加不稳定性，使用成员函数进行封装。
// 比如要获取专辑的名字，那就创建如下的方法
/**
 * 获取主播的名字
 * @returns {string} 主播名字
 */
SearchedSinger.prototype.getName = function() {
    return this.singerJson.anchor_name;
};

/**
 * 获取专辑数量
 * @returns {number} 专辑数量
 */
SearchedSinger.prototype.getAlbumNum = function() {
    return this.singerJson.anchor_album_num;
}

/**
 * 获取主播ID
 * @returns {string} 主播ID
 */
SearchedSinger.prototype.getId = function() {
    return this.singerJson.anchor_id;
}

/**
 * 获取粉丝数量
 * @returns {number} 粉丝数量
 */
SearchedSinger.prototype.getFansNum = function() {
    return this.singerJson.anchor_fans_num;
}

/**
 * 获取节目数量
 * @returns {number} 节目数量
 */
SearchedSinger.prototype.getShowNum = function() {
    return this.singerJson.anchor_show_num;
}

/**
 * 获取主播logo
 * @returns {string} 主播logo
 */
SearchedSinger.prototype.getLogoUri = function() {
    return this.singerJson.anchor_logo;
}

module && (module.exports = SearchedSinger);