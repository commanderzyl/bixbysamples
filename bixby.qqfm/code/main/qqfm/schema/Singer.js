/**
 * 主播对象
 * @param {Object} singerJson 这是从qq fm 获取的原生
 * json结构对象，形式如下，为了简单起见，我们直接保存起来使用，
 * 可以参考 http://api.fm.qq.com/
 * 不会再单独创建所有的变量了。
 * {
        "anchor_album_num": 1,
        "anchor_create_timestamp": 1539852189,
        "anchor_desc": "微博：蕊希Erin \\n微信公众号：蕊希（ID：ruixi709）\\n商务合作请加微信：ruixi20170906（请注明来意）\\n听她的声音，会上瘾。\\n\\n新书《总要习惯一个人》已全面上市。",
        "anchor_fans_num": 1238701,
        "anchor_gender": 0,
        "anchor_id": "4484209",
        "anchor_logo": "http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/n/7/0028xP6u4ERvn7.jpg?time=1539852560",
        "anchor_name": "蕊希",
        "anchor_show_num": 384
    }
 */
function Singer(singerJson) {
    this.singerJson = singerJson;
}

// 下面可以添加需要的函数, 一定不要直接获取
// 属性值，这样会破坏封装，增加不稳定性，使用成员函数进行封装。
// 比如要获取专辑的名字，那就创建如下的方法
/**
 * 获取主播的名字
 * @returns {string} 主播名字
 */
Singer.prototype.getName = function() {
    return this.singerJson.anchor_name;
};

module && (module.exports = Singer);