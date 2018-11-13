/**
 * http客户端对象，如果在bixby环境上，使用
 * bixby对象，如果不是，则使用node js下的客户端对象
 */
function HttpClient() {}

/**
 * 执行一个http GET请求
 * @param {string} url 请求的完整地址
 * @param {Object} options 请求体，格式如下
 * format: 输入格式，通常为 format: "json",
 * query: 请求参数，query: {'a':b}
 */
HttpClient.prototype.getUrl = function(url, options) {
    var http = http;
    if (!http) {
        //使用node js发起请求
        return getUrl(url, options);
    }

    // 使用bixby中的http对象
    return http.getUrl(url, options);
};

/**
 * 返回当前是否可用，如果不可用，则说明我们在不支持的环境下支行。
 * 返回false，可以让调用者根据情况处理，比如自己返回假数据。
 */
HttpClient.prototype.disabled = function() {
    var http = http;
    if (!http) {
        return true;
    }
    return false;
};

/**
 * 使用node js发起请求，由于公司网络限制原因，无法加载必要的库，所以此处返回空，
 * 在上一层请求的地方返回假数据。
 * @param {string} url 
 * @param {*} options 
 */
function getUrl(url, options) {
    return null;
}

module && (module.exports = HttpClient);