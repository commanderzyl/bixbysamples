var lib = require('./lib/Base.js')
var loop = require('./lib/LoopHandling.js')
module.exports = function changeDate(baseResult, departureDate) {
  var departureCity = baseResult.departureCity;
  var arrivalCity = baseResult.arrivalCity;
  var dateTime = baseResult.recycleParams.dateTime
  var dateTimeInterval = baseResult.recycleParams.dateTimeInterval
  var airline = baseResult.recycleParams.airline
  
  // 获取requestDate
  var dateObj = loop.getDapartureDateInfo(departureDate)
  var requestDate = dateObj.requestDate
  var detailDate = dateObj.departDate
  var nlgShowDate = dateObj.userInputDate
  
  var obj = lib.getEntireData(departureCity, arrivalCity, requestDate, airline, dateTime, dateTimeInterval, departureDate)
  var showStyle = lib.showDialogType(baseResult, departureCity, arrivalCity, requestDate)
  var recommendData = lib.getRecommendData(obj)
  baseResult = lib.getBaseResult(obj, recommendData, showStyle, detailDate)
  baseResult.departTime = nlgShowDate
  baseResult.departureCity = departureCity
  baseResult.arrivalCity = arrivalCity
  baseResult.recycleParams = lib.setRecycleParams(dateTime, dateTimeInterval, departureDate, airline)
  return baseResult
}
