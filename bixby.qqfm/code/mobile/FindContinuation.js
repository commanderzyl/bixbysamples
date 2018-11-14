module.exports.function = function findContinuation(ordinal, sSinger, sAlbum, $vivContext) {
    //首先设置deviceID
    ConfigMgr.getInstance().setDeviceId(base.getUserId($vivContext.userId));
    return {
        ordinal: ordinal,
        sSinger: sSinger,
        sAlbum: sAlbum
    };
}