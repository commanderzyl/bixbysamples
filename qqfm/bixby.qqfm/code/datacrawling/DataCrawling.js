/**
 * 此文件是使用node js编写的，用来爬取企鹅FM中的数据的，需要
 * 在node js环境下使用，放在这里是为了使用的方便性，这个文件不参与
 * capsule的使用。
 */

var appid="1107924367";
var fs = require("fs");
var http = require("./httpRequest");

function crawlData() {
    var categoriesLevel1 = http.getCategoryList({
        category_id: 0,
        appid: "1107924367",
        deviceid: "samsung-device-model1"
    });
    //console.log("crawlData, categories: " + categories);
    var level1 = [];
    for (var index = 0; index < categoriesLevel1.categoryList.length; index++) {
        level1.push({
            category_id: categoriesLevel1.categoryList[index].category_id,
            category_name: categoriesLevel1.categoryList[index].category_name
            });
        // var subCategory = http.getCategoryList({
        //     category_id: categoriesLevel1.categoryList[index].category_id,
        //     appid: "1107924367",
        //     deviceid: "samsung-device-model1"
        // });
        
        // for (var ii = 0; ii < subCategory.categoryList.length; ii++) {
        //     level1.push(subCategory.categoryList[ii].category_id);
        // }
    }

    //console.log(("level1[index]: " + typeof level1[0]));
    // 分类获取不同ID下的专辑名和主播名
    for (var index = 0; index < level1.length; index++) {
        var pagination_cursor = 0;
        var pagination_size = 30;
        has_more = 1;
        var album_names = [];
        var anchor_names = [];
        //var category_id = level1[index].category_id;
        // if (category_id != '41092') {
        //     continue;
        // }
        console.log("开始读取分类: " + level1[index].category_name);
        while (has_more == 1) {
            var res = http.getCategoryAlbumList({
                category_id: level1[index].category_id,
                appid: "1107924367",
                deviceid: "samsung-device-model1",
                pagination_cursor: pagination_cursor,
                pagination_size: pagination_size
            });

            if (res.ret != 0) {
                console.log("failed: " + JSON.stringify(res));
                throw new Error("failed");
            }
            
            var album_list = res.album_list;
            for (var i = 0; i < album_list.length; i++) {
                var album = album_list[i];
                var album_name = album.album_name;
                var anchor_name = album.album_owner ? album.album_owner.anchor_name: null;
                if (album_name) {
                    album_names.push(album_name);
                }
                if (anchor_name) {
                    anchor_names.push(anchor_name);
                }
            }
            has_more = res.has_more;
            pagination_cursor =  parseInt(res.pagination_cursor) + parseInt(res.pagination_size);
            pagination_size = 30;
            //console.log("has_more, cursor, size: (" + has_more + ", " + res.pagination_cursor + ", " + 
            //res.pagination_size + ")");
        }

        // 开始分别写入文件
        if (album_names.length != 0) {
            writeFile(level1[index].category_name + ".album_names", album_names.join("\n"));
        }

        if (anchor_names.length != 0) {
            writeFile(level1[index].category_name + ".anchor_names", anchor_names.join("\n"));
        }

        console.log("完成分类" + level1[index].category_name + " 的爬取, 专辑数量: " + album_names.length
            + ", 主播数量: " + anchor_names.length);
    }
}

function writeFile(filename, data) {
    var fd;

    try {
        fd = fs.openSync(filename, 'w');
        fs.appendFileSync(fd, data, 'utf8');
    } catch (err) {
    /* 异常处理 */
        console.log("write file failed, err = " + JSON.stringify(err));
    } finally {
        if (fd !== undefined)
            fs.closeSync(fd);
    }
}

function test() {
    writeFile("qqfm.txt", "heelo\nwhat");
}
//test();
crawlData();
