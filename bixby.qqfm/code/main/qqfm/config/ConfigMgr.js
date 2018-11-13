var configInfo = {
    "appid": config ? config.get("qqfm.appid") : "experience",
    "appkey": config ? config.get("qqfm.appkey") : "experiencekey",
    "deviceid": undefined
};

/**
 * 管理基本配置信息对象，主要保存了appid， appkey，deviceid等配置信息 
 */
function ConfigMgr() {
    this.configInfo = configInfo;
    this.url = "http://api.fm.qq.com";
}

ConfigMgr.getInstance = function() {
    if (ConfigMgr.instance) {
        return ConfigMgr.instance;
    }

    ConfigMgr.instance = new ConfigMgr();
    return ConfigMgr.instance;
};

/**
 * 获取appid值
 */
ConfigMgr.prototype.getAppId = function() {
    return this.configInfo.appid;
};

ConfigMgr.prototype.getAppKey = function() {
    return this.configInfo.appkey;
};

ConfigMgr.prototype.getDeviceId = function() {
    if (!this.configInfo.deviceid) {
        console.log("bad deviceId");
    }
    return this.configInfo.deviceid;
};

ConfigMgr.prototype.setDeviceId = function(deviceid) {
    this.configInfo.deviceid = deviceid;
}

ConfigMgr.prototype.getUrl = function() {
    return this.url;
};

module && (module.exports = ConfigMgr);