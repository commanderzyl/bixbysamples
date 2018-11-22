var lib = require('./lib/Base.js')
var iteration = require('./lib/IterationBase.js')
var loop = require('./lib/LoopHandling.js')
module.exports.function = function updateSearchParameter(baseResult, departureCity, arrivalCity, dateTime, dateTimeInterval, departureDate, airline, parameter) {

  popupMidPage(departureCity, arrivalCity, airline, parameter)

  if (departureDate == undefined || departureDate.length == 0) {
    departureDate = baseResult.recycleParams.departureDate
  }

  if ((dateTimeInterval == undefined || dateTimeInterval.length == 0) && dateTime == undefined) {
    dateTime = baseResult.recycleParams.dateTime
    dateTimeInterval = baseResult.recycleParams.dateTimeInterval
  }

  if (airline == undefined) {
    airline = baseResult.recycleParams.airline
  }

  if (departureCity == undefined) {
    departureCity = baseResult.departureCity
  } else {
    departureCity = lib.checkDepartureCity(departureCity)
  }
  if (arrivalCity == undefined) {
    arrivalCity = baseResult.arrivalCity
  } else {
    arrivalCity = lib.checkArrivalCity(arrivalCity)
  }

  // 获取requestDate
  var dateObj = loop.getDapartureDateInfo(departureDate)
  var requestDate = dateObj.requestDate
  var detailDate = dateObj.departDate
  var nlgShowDate = dateObj.userInputDate
  console.log("+++++++requestDate++++++++" + requestDate)
  var obj = lib.getEntireData(departureCity, arrivalCity, requestDate, airline, dateTime, dateTimeInterval, departureDate)
  
  // noFlight handling
  if (lib.checkDataIsEmpty(obj)) {
    return lib.noFlightHandling(departureCity, arrivalCity, dateTime, dateTimeInterval, departureDate, airline)
  }
  
  var showStyle = lib.showDialogType(baseResult, departureCity, arrivalCity, requestDate)
  var recommendData = lib.getRecommendData(obj)
  baseResult = lib.getBaseResult(obj, recommendData, showStyle, detailDate)
  baseResult.departTime = nlgShowDate
  baseResult.departureCity = departureCity
  baseResult.arrivalCity = arrivalCity
  baseResult.recycleParams = lib.setRecycleParams(dateTime, dateTimeInterval, departureDate, airline)
  return baseResult
}

function popupMidPage(departureCity, arrivalCity, airline, parameter) {

  if (parameter != undefined && parameter.length != 0) {
    if (inArray("departure_param", parameter) && departureCity == undefined) {
      throw fail.checkedError("未输入出发城市", "ToInputDepartureCity")
    } else if (inArray("arrival_param", parameter) && arrivalCity == undefined) {
      throw fail.checkedError("未输入目的城市", "ToInputArrivalCity")
    } else if (inArray("airline_param", parameter) && airline == undefined) {
      throw fail.checkedError("未输入航空公司", "ToInputAirline")
    }
  }
}

function inArray(string, array) {

  for (var i = 0; i < array.length; i++) {
    if (string == array[i]) {
      return true
    }
  }
  return false
}
