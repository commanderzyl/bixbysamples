/**
 * 主播名下的专辑对象
 * 搜索使用/v1/detail/get_singer_album_list得到的album对象
 * {
            "album_cover":"http://imgcache.qq.com/fm/photo/album/rmid_album_360/a/W/000CcMJR3vpnaW.jpg?time=1508989179",
            "album_desc":"精选了郭德纲相声中的经典唱段，分享给大家。郭德纲，相声演员，1973年生于天津，北京德云社的创办者。自幼酷爱民间艺术。8岁投身艺坛，曾受到多位相声名家的指点、传授。其间又潜心学习了京剧、评剧、河北梆子等姊妹剧种，辗转于梨园，兼工文丑与铜锤行当的经历，对丰富自己的相声表演起了十分重要的作用。通过对多种艺术形式的借鉴，逐渐地形成了自己的表演风格。",
            "album_id":"rd000CcMJR3vpnaW",
            "album_is_charge":0,
            "album_is_collected":0,
            "album_name":"郭德纲唱段集萃",
            "album_owner":{
                "anchor_album_num":0,
                "anchor_create_timestamp":1492757789,
                "anchor_desc":"郭德纲，1973年生于天津，自幼酷爱民间艺术。8岁投身艺坛，先拜评书前辈高庆海学习评书，后曾跟随相声名家常宝丰学相声，曾受到多位相声名家的指点、传授。其间又潜心学习了京剧、评剧、河北梆子等姊妹剧种，辗转于梨园，兼工文丑与铜锤行当的经历，对丰富自己的相声表演起了十分重要的作用。通过对多种艺术形式的借鉴，逐渐地形成了自己的表演风格。2005年底，在网络与媒体的相互作用之下，郭德纲借势风云突起，凭借着自己多年的磨打锤炼，一跃成为现今相声界年轻演员之中的佼佼者之一。 是相声世家侯耀文的弟子。",
                "anchor_fans_num":115088,
                "anchor_gender":0,
                "anchor_id":"150882",
                "anchor_logo":"http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/e/p/002sLf3n3vr9ep.jpg?time=1429086104",
                "anchor_name":"郭德纲",
                "anchor_show_num":435
            },
            "album_update_timestamp":1502954402,
            "category":[
                {
                    "category_id":"4",
                    "category_name":"相声评书",
                    "level":1
                },
                {
                    "category_id":"38963",
                    "category_name":"郭德纲",
                    "level":2
                }
            ],
            "is_serial":1,
            "show_list":[
                {
                    "show_cover":"http://imgcache.qq.com/fm/photo/album/rmid_album_360/a/W/000CcMJR3vpnaW.jpg?time=1508989179",
                    "show_create_timestamp":1502954402,
                    "show_desc":"郭德纲经典唱段。若有侵权，敬请原创者或版权所有人明示。本人见字，立即删除！",
                    "show_duration":76,
                    "show_id":"rd003NK3rZ1dsC4R",
                    "show_is_charge":0,
                    "show_is_collected":0,
                    "show_name":"郭德纲-山歌变调-九里山前摆战场",
                    "show_sequence":56
                }
            ],
            "show_num":56,
            "show_sort_type":0
        }
 */
function SingerAlbum(albumJson) {
    this.albumJson = albumJson;
}

/**
 * 获取专辑的名字
 * @returns {string} 专辑名字
 */
SingerAlbum.prototype.getName = function() {
    return this.albumJson.album_name;
};

SingerAlbum.prototype.getId = function() {
    return this.albumJson.album_id;
};

/**
 * 获取更新时间
 * @returns {number} 时间戳
 */
SingerAlbum.prototype.getUpdateTimestamp = function() {
    return this.albumJson.album_update_timestamp;
}

module && (module.exports = SingerAlbum);