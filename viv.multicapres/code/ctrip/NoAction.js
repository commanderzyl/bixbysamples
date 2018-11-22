module.exports.function = function noAction () {
  
  throw fail.checkedError("不支持该查询方式", "NotSupport")
  return {}
}
