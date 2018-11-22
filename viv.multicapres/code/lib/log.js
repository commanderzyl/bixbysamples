// this is for debug
// when submit as public, please set LOG_ENABLE = false
// var LOG_ENABLE = true;
var LOG_ENABLE = false;

exports.debug = function debug(tag, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12) {
  if (LOG_ENABLE) {
    console.debug(tag, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11, arg12)
  }
}