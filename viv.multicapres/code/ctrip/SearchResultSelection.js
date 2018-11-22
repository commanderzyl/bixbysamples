var lib = require('./lib/Base.js')
var newLib = require('./lib/IterationBase.js')
module.exports.function = function searchResultSelection(baseResult, target, priority, flightNo, departTime, arrivalTime) {

  return getSelectResult(baseResult, target, priority, flightNo, departTime, arrivalTime)
}

function getSelectResult(baseResult, target, priority, flightNo, departTime, arrivalTime) {

  var object
  if (target == "latest") {
    if (baseResult.showStyle != "queryMore") {
      object = lib.getDataInfo(baseResult.recommendData[baseResult.recommendData.length - 1])
    } else {
      object = lib.getDataInfo(baseResult.dataInfo[baseResult.dataInfo.length - 1])
    }
    object.chooseStyle = "最后一个"
    return object

  } else if (priority == "mostExpensive") {

    object =  lib.getDataInfo(baseResult.dataInfo[baseResult.dataInfo.length - 1])
    object.chooseStyle = "最贵的"
    return object
  } else if (priority == "slowest") {
    object = getSlowestFlight(baseResult)
    object.chooseStyle = "最慢的"
    return object
  }else if(priority == "earliestDeparture"){
    object = getEarliestFlight(baseResult)
    object.chooseStyle = "最早出发的"
    return object
  }else if(priority == "latestDeparture"){
    object = getlastestFlight(baseResult)
    object.chooseStyle = "最晚出发的"
    return object
  }

  if (baseResult.showStyle == "showRecommend" || baseResult.showStyle == "ChangeArrivalCity" || baseResult.showStyle == "ChangeDepartureCity" || baseResult.showStyle == "ChangeDepartureDate") {
    if (priority != undefined && priority <= baseResult.recommendData.length && (priority - 1) >= 0) {
      object = lib.getDataInfo(baseResult.recommendData[priority - 1])
      if(priority == "1"){
        object.chooseStyle = "最便宜的"
      }else{
        object.chooseStyle = "最快的"
      }
      return object
    } else if (target != undefined && target <= baseResult.recommendData.length && (target - 1) >= 0) {
      object = lib.getDataInfo(baseResult.recommendData[target - 1])
      object.chooseStyle = "第" + target + "个"
      return object
    }

    return getFlightByNewParams(flightNo, departTime, arrivalTime, baseResult.dataInfo)
  } else if (baseResult.showStyle == "queryMore" || baseResult.showStyle == "OrderByElapsedTime" || baseResult.showStyle == "OrderByDepartTime" || baseResult.showStyle == "OrderByPrice") {

    if (priority != undefined && priority <= baseResult.recommendData.length && (priority - 1) >= 0) {
      object = lib.getDataInfo(baseResult.recommendData[priority - 1])
      if(priority == "1"){
        object.chooseStyle = "最便宜的"
      }else{
        object.chooseStyle = "最快的"
      }
      return object
    } else if (target != undefined && target <= baseResult.dataInfo.length && (target - 1) >= 0) {
      object = lib.getDataInfo(baseResult.dataInfo[target - 1])
      object.chooseStyle = "第" + target + "个"
      return object
    }

    return getFlightByNewParams(flightNo, departTime, arrivalTime, baseResult.dataInfo)
  } 
  
//   else if (baseResult.showStyle == "OrderByElapsedTime" || baseResult.showStyle == "OrderByDepartTime" || baseResult.showStyle == "OrderByPrice") {
// 
//     if (priority != undefined && priority <= baseResult.recommendData.length && (priority - 1) >= 0) {
//       return lib.getDataInfo(baseResult.recommendData[priority - 1])
//     } else if (target != undefined && target <= baseResult.dataInfo.length && (target - 1) >= 0) {
//       return lib.getDataInfo(baseResult.dataInfo[target - 1])
//     }
//     return getFlightByNewParams(flightNo, departTime, arrivalTime, baseResult.dataInfo)
//   }
  return null
}

function getFlightByNewParams(flightNo, departTime, arrivalTime, dataInfo) {
  if (flightNo != undefined) {
    for (var i = 0; i < dataInfo.length; i++) {
      if (dataInfo[i].flightName.indexOf(flightNo.toString().replace(/\s+/g, "").toUpperCase()) != -1) {
        var object = lib.getDataInfo(dataInfo[i])
        object.chooseStyle = "flightNo"
        return object
      }
    }
  } else if (departTime != undefined && departTime.length != 0) {
    for (var a = 0; a < departTime.length; a++) {
      var formatDepartTime = formatInputTime(departTime[a])
      console.log("formatDepartTime  " + formatDepartTime)
      for (var i = 0; i < dataInfo.length; i++) {
        if (formatDepartTime.toString() == dataInfo[i].departTime.toString()) {
          var object = lib.getDataInfo(dataInfo[i])
          object.chooseStyle = "departTime"
          return object
        }
      }
    }

  } else if (arrivalTime != undefined && arrivalTime.length != 0) {

    for (var a = 0; a < arrivalTime.length; a++) {
      var formatArrivalTime = formatInputTime(arrivalTime[a])
      console.log("formatArrivalTime  " + formatArrivalTime)
      for (var i = 0; i < dataInfo.length; i++) {
        if (formatArrivalTime.toString() == dataInfo[i].arriveTime.toString()) {
          var object = lib.getDataInfo(dataInfo[i])
          object.chooseStyle = "arrivalTime"
          return object
        }
      }
    }
  }
  throw fail.checkedError("好像不能按照你说的方式选择航班。再告诉我一次，你要选择哪个？", "ChooseNoError")
}

function formatInputTime(inputTime) {
  var formatTime = "";
  if (inputTime.time.hour < 10) {
    if (inputTime.time.minute < 10) {
      formatTime = "0" + inputTime.time.hour + ":" + "0" + inputTime.time.minute;
    } else {
      formatTime = "0" + inputTime.time.hour + ":" + inputTime.time.minute;
    }
  } else {
    if (inputTime.time.minute < 10) {
      formatTime = inputTime.time.hour + ":" + "0" + inputTime.time.minute;
    } else {
      formatTime = inputTime.time.hour + ":" + inputTime.time.minute;
    }
  }
  return formatTime
}

function getSlowestFlight(baseResult) {
  var dataInfo = baseResult.dataInfo
  var minutes = 0
  for (var i = 0; i < dataInfo.length; i++) {
    var dur = dataInfo[i].dur
    dur = dur.replace(/[^0-9]*/ig, " ")
    var array = dur.split(" ")
    if (array.length == 1) {
      if (array[0] > minutes) {
        minutes = array[0]
      }
    } else if (array.length == 2) {
      if (60 * (array[0]) + (array[1]) > minutes) {
        minutes = 60 * (array[0]) + (array[1])
      }
    }
  }

  for (var i = 0; i < dataInfo.length; i++) {
    var dur = dataInfo[i].dur
    dur = dur.replace(/[^0-9]*/ig, " ")
    var array = dur.split(" ")
    if (array.length == 1) {
      if (array[0] == minutes) {
        return dataInfo[i]
      }
    } else if (array.length == 2) {
      if (60 * array[0] + array[1] == minutes) {
        return dataInfo[i]
      }
    }
  }
  return dataInfo[0]
}

function getEarliestFlight(baseResult){

  var dataInfo = baseResult.dataInfo
  var data
  for (var i = 0; i < dataInfo.length; i++) {
    if(i == 0){
      data = dataInfo[i]      
    }else{
      var value1 = newLib.calculateDepartTime(data.departTime)
      var value2 = newLib.calculateDepartTime(dataInfo[i].departTime)

      if (value1.length == value2.length && value1.length == 2) {

        console.log("value1.length" + value1[0] + "    " + value1[1])
        if(Number(value1[0])*60 + Number(value1[1]) > Number(value2[0])*60 + Number(value2[1])){
          data = dataInfo[i]
        }
      }
    }
  }

  return data
}

function getlastestFlight(baseResult){

  var dataInfo = baseResult.dataInfo
  var data
  for (var i = 0; i < dataInfo.length; i++) {
    if(i == 0){
      data = dataInfo[i]      
    }else{
      var value1 = newLib.calculateDepartTime(data.departTime)
      var value2 = newLib.calculateDepartTime(dataInfo[i].departTime)

      if (value1.length == value2.length && value1.length == 2) {

        console.log("value1.length" + value1[0] + "    " + value1[1])
        if(Number(value1[0])*60 + Number(value1[1]) < Number(value2[0])*60 + Number(value2[1])){
          data = dataInfo[i]
        }
      }
    }
  }

  return data
}





