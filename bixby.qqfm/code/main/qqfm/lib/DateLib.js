/**
 * 时间类，js支持Date类，但是bixby只支持dates库
 */
function MyDate() {
    this.supportDate = false;
    if (typeof Date == 'object') {
        this.supportDate = true;
    }
}

/**
 * 获取当前时间的毫秒数
 */
MyDate.prototype.getCurrentMilliseconds = function() {
    if (this.supportDate) {
        return parseInt(new Date().getCurrentMilliseconds() / 1000);
    } else {
        return parseInt(Math.floor((dates.ZonedDateTime.now("UTC").getMillisFromEpoch()) / 1000));
    }
}

module && (module.exports = MyDate);