function getUserId(id) {
    var idStr = id.toString();
    var startIndex = idStr.indexOf(':') + 1;
    var endIndex = idStr.length;
    idStr = idStr.substring(startIndex, endIndex);
    return idStr;
}

function getCurrentMilliseconds() {
    return parseInt(Math.floor((dates.ZonedDateTime.now("UTC").getMillisFromEpoch()) / 1000));
}

/**
 * 将duration转换成 小时:分钟:秒 的格式输出
 * @param {int} duration 秒数
 */
function formatDuration(duration) {
    var formated = "";
    //小时
    var hour = parseInt(duration / 3600);
    if (('' + hour).length < 2) {
        formated += '0' + hour + ":";
    } else {
        formated += '' + hour + ":";
    }

    var minute = parseInt((duration - hour * 3600) / 60);
    if (('' + minute).length < 2) {
        formated += '0' + minute + ":";
    } else {
        formated += '' + minute + ":";
    }

    var seconds = duration - hour * 3600 - minute * 60;
    if (('' + seconds).length < 2) {
        formated += '0' + seconds;
    } else {
        formated += '' + seconds;
    }
    return formated;
}

/**
 * 将json串转换成Singer类型
 * {
            "anchor_album_num":7,
            "anchor_create_timestamp":1474787700,
            "anchor_desc":"微博@DJ林浪丨微信平台：林浪丨粉丝③群162578876丨粉丝④群162578508",
            "anchor_fans_num":91459,
            "anchor_gender":1,
            "anchor_id":"272908",
            "anchor_logo":"http://imgcache.qq.com/fm/photo/singer/rmid_singer_240/5/d/000ik7px3Qvx5d.jpg?time=1474788081",
            "anchor_name":"DJ林浪",
            "anchor_show_num":1022
        }
 */
function mapToSinger(jsonString) {
    var a = jsonString;
    return {
        anchor_id: a.anchor_id,
        anchor_album_num: a.anchor_album_num,
        anchor_create_timestamp: a.anchor_create_timestamp,
        anchor_desc: a.anchor_desc,
        anchor_fans_num: a.anchor_fans_num,
        anchor_gender: a.anchor_gender,
        anchor_logo: a.anchor_logo,
        anchor_name: a.anchor_name,
        anchor_show_num: a.anchor_show_num,
        recent_album_name: a.recent_album_name
    };
}

function mapToShow(jsonString) {
    var a = jsonString;
    var show = {
        show_id: a.show_id,
        show_cover: a.show_cover,
        show_create_timestamp: a.show_create_timestamp,
        show_create_timestamp_display: a.show_create_timestamp_display,
        show_desc: a.show_desc,
        show_duration: a.show_duration,
        show_duration_display: a.show_duration_display,
        show_is_collected: a.show_is_collected,
        show_name: a.show_name,
        show_is_charge: a.show_is_charge,
        show_sequence: a.show_sequence,
        schema: a.schema
    };

    if (a.play_url) {
        show.play_url = {
            high: a.play_url.high,
            medium: a.play_url.medium,
            small: a.play_url.small,
            high_file_size: a.play_url.high_file_size,
            medium_file_size: a.play_url.medium_file_size,
            small_file_size: a.play_url.small_file_size
        };
    }

    if (a.belong_album_info) {
        show.belong_album_info = mapToAlbum(a.belong_album_info);
    }

    return show;
}

function mapToAlbum(jsonString) {
    var a = jsonString;
    var album = {
        album_cover: a.album_cover,
        album_desc: a.album_desc,
        album_id: a.album_id,
        album_is_charge: a.album_is_charge,
        album_is_collected: a.album_is_collected,
        album_name: a.album_name,
        album_update_timestamp: a.album_update_timestamp,
        category: a.category,
        is_serial: a.is_serial,
        show_num: a.show_num,
        show_sort_type: a.show_sort_type,
        schema: a.schema
    };
    if (a.album_owner) {
        album.album_owner = mapToSinger(a.album_owner);
    }
    if (a.show_list) {
        album.show_list = a.show_list.map(mapToShow);
    }

    return album;
}

module.exports = {
    getUserId: getUserId,
    getCurrentMilliseconds: getCurrentMilliseconds,
    formatDuration: formatDuration,
    mapToSinger: mapToSinger,
    mapToShow: mapToShow,
    mapToAlbum: mapToAlbum
}