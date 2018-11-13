var Category = require("../main/qqfm/schema/Category");
var AlbumMgr = require("../main/qqfm/AlbumMgr");
var ConfigMgr = require("../main/qqfm/config/ConfigMgr");
var SingerMgr = require("../main/qqfm/SingerMgr");
var ShowMgr = require("../main/qqfm/ShowMgr");

function test() {
    // 由于需要deviceid,所以需要首先设置一个虚拟的deviceid。
    ConfigMgr.getInstance().setDeviceId("352983094892511");
    // v1.1 
    // 搜索
    // B a) b) 按大小分类查看点播专辑列表
    testGetAlbumList();

    // B c) 查看含有关键词的点播专辑列表
    testSearchAlbum();

    // B c) 查看含有关键词的主播列表
    testSearchSinger();

    // B d) 查看最新更新的专辑列表(时间区间是发话当天) 
    testSearchRecentAlbumList();

    // B d) 查看最新更新的节目列表(时间区间是发话当天)
    testSearchRecentShowList();

    // 播放
    // B a) b) 按大小分类播放专辑
    testPlayCategoryAlbum();

    // B c) 播放含有关键词的点播专辑
    testPlayAlbum();

    // B c) 播放最新更新的专辑 
    //testPlayRecentAlbum();

    // B c) 播放最新更新的节目
    //testPlayRecentShow();
}

// 按大小分类查看点播专辑列表
function testGetAlbumList() {
    var albumMgr = AlbumMgr.getInstance();
    //先测试大分类，再测试小分类
    var categoryName = "有声小说",
        subCategoryName = "晚安心语";
    var albumList = albumMgr.getAlbumList(categoryName);
    if (albumList instanceof Array && albumList.length > 0) {
        console.log("成功按大分类查看点播专辑列表, 分类名：" + categoryName);
    } else {
        console.log("失败按大分类查看点播专辑列表, 分类名：" + categoryName);
    }

    albumList = albumMgr.getAlbumList(subCategoryName);
    if (albumList instanceof Array && albumList.length > 0) {
        console.log("成功按小分类查看点播专辑列表, 分类名：" + subCategoryName);
    } else {
        console.log("失败按小分类查看点播专辑列表, 分类名：" + subCategoryName);
    }
}

// 查看含有关键词的点播专辑列表
function testSearchAlbum() {
    var searchWord = "小猪佩奇";
    var albumMgr = AlbumMgr.getInstance();
    var albumList = albumMgr.searchAlbum(searchWord);
    if (albumList instanceof Array && albumList.length > 0) {
        console.log("成功获取含有关键词'" + searchWord + "' 的专辑列表");
    } else {
        console.log("获取含有关键词'" + searchWord + "' 的专辑失败");
    }
}

// 查看含有关键词的主播列表
function testSearchSinger() {
    var searchWord = "蕊希";
    var singerMgr = SingerMgr.getInstance();
    var singerList = singerMgr.searchSinger(searchWord);
    if (singerList instanceof Array && singerList.length > 0) {
        console.log("成功获取含有关键词'" + searchWord + "' 的主播列表");
    } else {
        console.log("获取含有关键词'" + searchWord + "' 的主播失败");
    }
}

// B d) 查看最新更新的专辑列表(时间区间是发话当天) 
function testSearchRecentAlbumList() {
    var albumMgr = AlbumMgr.getInstance();
    var albumList = albumMgr.getRecentAlbum();
    if (albumList instanceof Array && albumList.length > 0) {
        console.log("成功获取最近更新的专辑列表");
    } else {
        console.log("获取最新更新的专辑失败或者暂无更新");
    }
}

// B d) 查看最新更新的节目列表(时间区间是发话当天)
function testSearchRecentShowList() {
    var showMgr = ShowMgr.getInstance();
    var showList = showMgr.getRecentShow();
    if (showList instanceof Array && showList.length > 0) {
        console.log("成功获取最近更新的节目列表");
    } else {
        console.log("获取最新更新的节目失败或者暂无更新");
    }
}

// B a) b) 按大小分类播放专辑
function testPlayCategoryAlbum() {
    var albumMgr = AlbumMgr.getInstance();
    //先测试大分类，再测试小分类
    var categoryName = "有声小说";
    var albumList = albumMgr.getAlbumList(categoryName);
    if (albumList instanceof Array && albumList.length > 0) {
        var show = albumList[0].getFirstShow();
        if (show) {
            var playUrl = show.getPlayUrl();
            if (playUrl) {
                console.log("按分类播放成功，分类名：" + categoryName + ", playUrl: " + playUrl);
                return;
            }
        }

    }

    console.log("按分类播放失败, 分类名：" + categoryName);


}

// B c) 播放含有关键词的点播专辑
function testPlayAlbum() {
    var searchWord = "小猪佩奇";
    var albumMgr = AlbumMgr.getInstance();
    var albumList = albumMgr.searchAlbum(searchWord);
    if (!(albumList instanceof Array && albumList.length > 0)) {
        console.log("获取含有关键词'" + searchWord + "' 的专辑失败");
        return;
    }

    var album = albumList[0];
    var showList = albumMgr.getAlbumShowList(album.getId());
    if (!showList || showList.length == 0) {
        console.log("无法获取专辑下的节目列表");
        return;
    }

    var playUrl = showList[0].getPlayUrl();
    console.log("播放专辑: playUrl:" + playUrl);
}

// B c) 播放最新更新的专辑 
//testPlayRecentAlbum();

// B c) 播放最新更新的节目
//testPlayRecentShow();

test();