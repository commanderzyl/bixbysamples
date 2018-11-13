var Show = require("./Show");
/**
 * 专辑对象
 * @param {Object} albumJson 这是从qq fm 获取的原生
 * json结构对象，形式如下，为了简单起见，我们直接保存起来使用，
 * 可以参考 http://api.fm.qq.com/
 * 不会再单独创建所有的变量了。
 * {
      "album_cover": "http://imgcache.qq.com/fm/photo/album/rmid_album_360/5/I/001dQpJ93sub5I.jpg?time=1488513418",
      "album_desc": "来企鹅FM听《央广新闻》",
      "album_id": "rd001dQpJ93sub5I",
      "album_is_charge": 0,//是否付费
      "album_is_collected": 0,
      "album_name": "央广新闻",
      "album_owner": { //主播
        "anchor_album_num": 0,
        "anchor_create_timestamp": 1445249074,
        "anchor_desc": "暂无介绍",
        "anchor_fans_num": 2154,
        "anchor_gender": -1,
        "anchor_id": "299721",
        "anchor_logo": "http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/Z/D/002Dpt241msiZD.jpg?time=1429773952",
        "anchor_name": "CNR中国之声",
        "anchor_show_num": 2259  //主播下的节目数
      },
      "album_update_timestamp": 1489661437, //专辑更新时间
      "category": [//专辑所属分类信息
        {
          "category_id": "5",
          "category_name": "新闻资讯",
          "level": 1
        },
        {
          "category_id": "38924",
          "category_name": "头条新闻",
          "level": 2
        }
      ],
      "is_serial": 1, //是否连载中 1连载 0完结
      "show_list": [ //专辑下的第一个节目（正序第一或倒叙第一）
        {
            "show_cover": "http://imgcache.qq.com/fm/photo/album/rmid_album_360/5/I/001dQpJ93sub5I.jpg?time=1506322286",
            "show_create_timestamp": 1510207821,
            "show_desc": "1",
            "show_duration": 136,
            "show_id": "rd002GQ0ja0EMTpb",
            "show_is_collected": 0,
            "show_name": "前三季度保险业成绩单 这些细节值得关注"
        }
      ],
      "show_num": 236, //专辑下节目数量
      "show_sort_type": 0 //专辑下节目的排序顺序(按时间) 0逆序  1正序
    }
 */
function Album(albumJson) {
    this.albumJson = albumJson;
}

// 下面可以添加需要的函数, 一定不要直接获取
// 属性值，这样会破坏封装，增加不稳定性，使用成员函数进行封装。
// 比如要获取专辑的名字，那就创建如下的方法
/**
 * 获取专辑的名字
 * @returns {string} 专辑名字
 */
Album.prototype.getName = function() {
    return this.albumJson.album_name;
};

Album.prototype.getId = function() {
    return this.albumJson.album_id;
};

/**
 * 获取专辑下的第一个节目
 * @returns {Show} 专辑下的第一个节目
 */
Album.prototype.getFirstShow = function() {
    if (this.albumJson.show_list && this.albumJson.show_list.length != 0) {
        return new Show(this.albumJson.show_list[0]);
    }
    return null;
};

module && (module.exports = Album);