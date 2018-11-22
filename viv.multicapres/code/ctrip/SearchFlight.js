var lib = require('./lib/Base.js')
var newLib = require('./lib/IterationBase.js')
var loop = require('./lib/LoopHandling.js')
module.exports = function SearchFlight(departureCity, location, arrivalCity, dateTime, dateTimeInterval, departureDate, airline) {

  if (departureCity == undefined) {
    if (location != undefined) {
      departureCity = location;
    } else {
      throw fail.checkedError("出发城市不存在", "ToInputDepartCity")
    }
  }

  // 获取requestDate
  var dateObj = loop.getDapartureDateInfo(departureDate)
  var requestDate = dateObj.requestDate
  var detailDate = dateObj.departDate
  var nlgShowDate = dateObj.userInputDate

  departureCity = lib.checkDepartureCity(departureCity)
  arrivalCity = lib.checkArrivalCity(arrivalCity)

  var baseResult = {}
  var obj = lib.getEntireData(departureCity, arrivalCity, requestDate, airline, dateTime, dateTimeInterval, departureDate)
  
  // noFlight handling
  if (lib.checkDataIsEmpty(obj)) {
    return lib.noFlightHandling(departureCity, arrivalCity, dateTime, dateTimeInterval, departureDate, airline)
  }
  
  var showStyle = "showRecommend"
  var recommendData = lib.getRecommendData(obj)
  baseResult = lib.getBaseResult(obj, recommendData, showStyle, detailDate)

  baseResult.departTime = nlgShowDate
  baseResult.departureCity = departureCity
  baseResult.arrivalCity = arrivalCity
  baseResult.recycleParams = lib.setRecycleParams(dateTime, dateTimeInterval, departureDate, airline)
  return baseResult
}
