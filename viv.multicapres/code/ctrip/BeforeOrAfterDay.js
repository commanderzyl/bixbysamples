var lib = require('./lib/Base.js')
var iterationLib = require('./lib/IterationBase.js')
var loop = require('./lib/LoopHandling.js')
module.exports.function = function beforeOrAfterDay(baseResult, someDay) {
  var dateTime = baseResult.recycleParams.dateTime
  var dateTimeInterval = baseResult.recycleParams.dateTimeInterval
  var departureDate = baseResult.recycleParams.departureDate
  var departureCity = baseResult.departureCity
  var arrivalCity = baseResult.arrivalCity
  var airline = baseResult.recycleParams.airline

  // 获取requestDate
  var timeDate = loop.getDapartureDateInfo(departureDate).timeDate
  departureDate = iterationLib.getPrivousOrNextDay(timeDate, someDay)
  
  var dateObj = loop.getDapartureDateInfo(departureDate)
  var requestDate = dateObj.requestDate
  var detailDate = dateObj.departDate
  var nlgShowDate = dateObj.userInputDate

  var obj = lib.getEntireData(departureCity, arrivalCity, requestDate, airline, dateTime, dateTimeInterval, departureDate)
  
   // noFlight handling
  if (lib.checkDataIsEmpty(obj)) {
    return lib.noFlightHandling(departureCity, arrivalCity, dateTime, dateTimeInterval, departureDate, airline)
  }

  var showStyle = lib.showDialogType(baseResult, departureCity, arrivalCity, requestDate)

  var recommendData = lib.getRecommendData(obj)
  var baseResult = lib.getBaseResult(obj, recommendData, showStyle, detailDate)
  baseResult.departTime = nlgShowDate
  baseResult.departureCity = departureCity
  baseResult.arrivalCity = arrivalCity
  baseResult.recycleParams = lib.setRecycleParams(dateTime, dateTimeInterval, departureDate, airline)
  return baseResult
}
