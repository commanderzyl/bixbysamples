var sha256 = require('./sha256.js')
var chineseCityNames = require('./ChineseCityNames.js')
var foreignCityNames = require('./ForeignCityNames.js')
var iteration = require('./IterationBase.js')
var provinceNames = require('./ProvinceNames.js')
var loop = require('./LoopHandling.js')
var airlineMap = require('./AirlineMap.js')
module.exports = {
  getEntireData: getEntireData,
  getRecommendData: getRecommendData,
  getBaseResult: getBaseResult,
  getDataInfo: getDataInfo,
  checkDateIsFuture: checkDateIsFuture,
  getDefaultDate: getDefaultDate,
  showDialogType: showDialogType,
  setDepartureDate: setDepartureDate,
  getDepatureDateFromArray: getDepatureDateFromArray,
  getLableStyle: getLableStyle,
  checkDataIsEmpty: checkDataIsEmpty,
  checkDepartureCity: checkDepartureCity,
  checkArrivalCity: checkArrivalCity,
  setRecycleParams: setRecycleParams,
  noFlightHandling: noFlightHandling
}

function noFlightHandling(departureCity, arrivalCity, dateTime, dateTimeInterval, departureDate, airline) {
  var baseResult = {}
  baseResult.departureCity = departureCity
  baseResult.arrivalCity = arrivalCity
  baseResult.recycleParams = setRecycleParams(dateTime, dateTimeInterval, departureDate, airline)
  baseResult.showStyle = "FlightNotExist"
  return baseResult
}

function setRecycleParams(dateTime, dateTimeInterval, departureDate, airline) {
  // recycle params for follow uy goal.
  var object = {}
  object.dateTime = dateTime
  object.dateTimeInterval = dateTimeInterval
  object.departureDate = departureDate
  object.airline = airline
  return object
}

function checkDepartureCity(departureCity) {
  if (getCityName(departureCity) == -1) {
    if (checkIsProvince(departureCity) != -1) {
      throw fail.checkedError("DepartCityIsProvince", "DepartCityIsProvince", {
        isProvince: checkIsProvince(departureCity)
      })
    }
    throw fail.checkedError("出发城市名错误", "DepartCityError")
  }

  return getCityName(departureCity)
}

function checkArrivalCity(arrivalCity) {

  if (getCityName(arrivalCity) == -1) {
    if (checkIsProvince(arrivalCity) != -1) {
      throw fail.checkedError("ArrivalCityIsProvince", "ArrivalCityIsProvince", {
        isProvince: checkIsProvince(arrivalCity)
      })
    }
    throw fail.checkedError("到达城市名错误", "ArrivalCityError")
  }

  return getCityName(arrivalCity)
}

function checkIsProvince(cityName) {
  var provinceList = provinceNames.citynames
  for (var i = 0; i < provinceList.length; i++) {
    if (cityName.indexOf(provinceList[i]) !== -1) {
      return provinceList[i]
    }
  }
  return -1
}

function checkDataIsEmpty(obj) {
  if (obj.dataInfo !== undefined && obj.dataInfo.length >= 1) {
    return false
  }
  return true
}

function getDepatureDateFromArray(departureDate) {
  if (departureDate !== undefined && departureDate.length > 1) {
    if (checkDateIsFuture(departureDate[1])) {
      return departureDate[1]
    } else {
      return departureDate[0]
    }
  } else if (departureDate !== undefined && departureDate.length == 1) {
    if (!checkDateIsFuture(departureDate[0])) {
      throw fail.checkedError("出发日期有问题", "DepartureDateError")
    } else {
      return departureDate[0]
    }
  } else {
    return getDefaultDate()
  }
}

function setDepartureDate(departureDate) {
  return {
    year: departureDate.year,
    month: departureDate.month,
    day: departureDate.day
  }
}

function showDialogType(baseResult, departureCity, arrivalCity, departureDate) {
  if (arrivalCity !== baseResult.arrivalCity) {
    return "ChangeArrivalCity"
  }
  if (departureCity !== baseResult.departureCity) {
    return "ChangeDepartureCity"
  }
  var requestDate = loop.getDapartureDateInfo(baseResult.recycleParams.departureDate).requestDate
  if (departureDate != requestDate) {
    return "ChangeDepartureDate"
  }

  return "showRecommend"
}

function getDefaultDate() {
  var departureDate = {}
  var dateTime = new dates.ZonedDateTime("UTC+08:00")
  var mills = dateTime.getMillisecond()
  var date = dateTime.withMillisecond(mills)
  departureDate.year = date.getYear()
  departureDate.month = date.getMonth()
  departureDate.day = date.getDay()
  return departureDate
}

function checkDateIsFuture(departureDate) {

  var year = new dates.ZonedDateTime("UTC+08:00").getYear()
  var month = new dates.ZonedDateTime("UTC+08:00").getMonth()
  var day = new dates.ZonedDateTime("UTC+08:00").getDay()

  if (departureDate.year < year) {
    return false
  } else if (departureDate.year === year) {
    if (departureDate.month < month || (departureDate.month === month && departureDate.day < day)) {
      return false
    }
  }
  return true
}

function getCityName(cityName) {

  var citynames = chineseCityNames.citynames
  for (var i = 0; i < citynames.length; i++) {
    for (var k = 0; k < citynames[i].length; k++) {
      if (cityName.indexOf(citynames[i][k]) !== -1) {
        return citynames[i][0]
      }
    }
  }
  var foreignCitys = foreignCityNames.citynames
  for (var j = 0; j < foreignCitys.length; j++) {
    if (cityName.indexOf(foreignCitys[j]) !== -1) {
      throw fail.checkedError("*****", "NotSupportForeignFlight")
    }
  }

  return -1
}

function getDataInfo(data) {
  return {
    flightName: data.flightName,
    departTime: data.departTime,
    arriveTime: data.arriveTime,
    from: data.from,
    to: data.to,
    flightIconUrl: data.flightIconUrl,
    price: data.price,
    discount: data.discount,
    date: data.date,
    dur: data.dur,
    flightUrl: data.flightUrl,
    day: data.day,
    lable: data.lable
  }
}

function getBaseResult(obj, recommendData, showStyle, date1) {
  console.log("obj ++" + obj.dataInfo.length)
  return {

    title: obj.title,
    showStyle: showStyle,
    searchDate: obj.searchDate,
    flightTime: obj.flightTime,
    nlgDeparttime: obj.nlgDeparttime,
    recommendData: recommendData.map(function (item) {
      var lable = getLableStyle(item)
      var flightIconUrl = getFilterFlightIconUrl(item.flightIcon)
      return {
        type: item.type,
        flightName: item.flight,
        departTime: item.dt,
        arriveTime: item.at,
        from: item.from,
        to: item.to,
        flightIconUrl: flightIconUrl,
        price: item.price,
        discount: item.discount,
        date: date1,
        dur: item.dur,
        flightUrl: item.flightUrl,
        day: item.day,
        lable: lable
      }
    }),

    dataInfo: obj.dataInfo.map(function (item) {
      var lable = getLableStyle(item)
      var flightIconUrl = getFilterFlightIconUrl(item.flightIcon)
      return {
        flightName: item.flight,
        departTime: item.dt,
        arriveTime: item.at,
        from: item.from,
        to: item.to,
        flightIconUrl: flightIconUrl,
        price: item.price,
        discount: item.discount,
        date: date1,
        dur: item.dur,
        flightUrl: item.flightUrl,
        day: item.day,
        lable: lable
      }
    })
  }
}

function getFilterFlightIconUrl(flightIcon) {
  if (startedWith(flightIcon, "http")) {
    return flightIcon
  } else {
    return "/images/icons/Icon_Flight.jpg"
  }
}

function startedWith(originalString, str) {
  if (str == null || str == "" || originalString.length == 0 || str.length > originalString.length) {
    return false;
  }
  if (originalString.substr(0, str.length) == str) {
    return true;
  } else {
    return false;
  }
  return true;
}

function getLableStyle(item) {
  for (var i = 0; i < item.cabin.length; i++) {
    if (item.price === item.cabin[i].pr) {
      return item.cabin[i].lable
    }
  }
  return "经济舱"
}

function getRecommendData(obj) {

  var array = obj.dataInfo

  if (JSON.stringify(array) === '[]') {
    throw fail.checkedError("两个城市间不存在航班", "FlightNotExist")
  }

  console.log("daodinalichulecuo")

  var recommendArray = []
  var lowestPrice = array[0]
  console.log("array.length" + array.length)
  for (var j = 0; j < array.length; j++) {
    if (array[j].price < lowestPrice.price) {
      lowestPrice = array[j]
    }
  }

  console.log("lowestPrice" + array.length)

  lowestPrice = shadowCopy(lowestPrice)
  lowestPrice.type = "最低价格"
  recommendArray.push(lowestPrice)

  var quickerObj = array[0]
  for (var i = 0; i < array.length; i++) {
    if (iteration.calculateMinutes(array[i].dur) < iteration.calculateMinutes(quickerObj.dur)) {
      quickerObj = array[i]
    }
  }

  quickerObj = shadowCopy(quickerObj)
  quickerObj.type = "最短时间"
  recommendArray.push(quickerObj)

  return recommendArray
}

function shadowCopy(source) {
  var copy = {}
  for (var i in source) {
    copy[i] = source[i]
  }
  return copy
}

function getEntireData(departureCity, arrivalCity, date, airline, dateTime, dateTimeInterval, departureDate) {

  var response
  var apiUrl = "http://openservice.ctrip.com/openservice/serviceproxy.ashx?"

  var str = "aid=792226&sid=1350537&userkey=8bcfb8a349f74d48a3a78de1cab33254&icode=628e8df02d6b482db73c0d6ac8498a6b&uuid=14bc468ef5954be4a1cca35b66b28bfd"
  var map = {
    "AID": "792226",
    "SID": "1350537",
    "token": sha256.sha256_digest(str),
    "format": "json",
    "E": "r6",
    "icode": "628e8df02d6b482db73c0d6ac8498a6b",
    "from": encodeURI(departureCity),
    "to": encodeURI(arrivalCity),
    "date": date,
    "UUID": "14bc468ef5954be4a1cca35b66b28bfd"
  }
  var string = ""
  for (var key in map) {
    if (map.hasOwnProperty(key)) {

      string = string + "&" + key + "=" + map[key]
    }
  }

  apiUrl = apiUrl + string

  response = http.getUrl(apiUrl, {
    format: "json",
  })

  if (response.ResponseStatus.Errors !== undefined && response.ResponseStatus.Errors !== null) {
    if (response.ResponseStatus.Errors.length >= 1 && response.ResponseStatus.Errors[0].Message !== null && response.ResponseStatus.Errors[0].Message.indexOf("cityname error") === 0) {

      if (response.ResponseStatus.Errors[0].Message.indexOf(arrivalCity) !== -1 && response.ResponseStatus.Errors[0].Message.indexOf(departureCity) === -1) {

        throw fail.checkedError("***", "ArrivalCityError")
      } else if (response.ResponseStatus.Errors[0].Message.indexOf(arrivalCity) === -1 && response.ResponseStatus.Errors[0].Message.indexOf(departureCity) !== -1) {
        throw fail.checkedError("***", "DepartCityError")
      }
      throw fail.checkedError("****", "CityNameError")
    }
  }

  var filterFlightResult = filterFlights(departureDate, dateTime, dateTimeInterval, response)
  response.dataInfo = filterFlightResult.departDateFilter

  if (response.dataInfo == undefined || response.dataInfo.length == undefined) {
    return response
  }
  console.log(" response.dataInfo " + response.dataInfo.length)
  response.nlgDeparttime = filterFlightResult.nlgDeparttime
  if (airline != undefined) {
    if (response.dataInfo != undefined && response.dataInfo.length != 0) {
      response.dataInfo = response.dataInfo.filter(function (a) {
        return compareFlight(a.flight, airline)
      })
    }
  }

  if (response.dataInfo != undefined && response.dataInfo.length != 0) {
    response.dataInfo = response.dataInfo.sort(iteration.compareDepartTime("dt"))
  }

  return response
}

function compareFlight(flight, airline) {
  var outerArray = airlineMap.flightNames
  for(var i = 0; i < outerArray.length; i++){
    var innerArray = outerArray[i]
    if(innerArray[1].indexOf(airline) !== -1){
      for(var j = 0; j < innerArray.length; j++){
        if(flight.indexOf(innerArray[j])!== -1){
          return true
        }
      }
    }
  }
  return false
}

function filterFlights(date, dateTime, dateTimeInterval, obj) {
  var filter;
  var departDateFilter;
  var startHour;
  var startMinute;

  // nlgDeparttime
  var nlgDeparttime

  if (dateTime) {
    if (dateTimeInterval.length > 0) {

      var object = filterByDateTimeInterval(obj, dateTimeInterval);
      departDateFilter = object.filterByDateTimeInterval
      nlgDeparttime = object.namedTimeInChinese
    } else {
      var object = filterByDateTime(obj, dateTime);
      departDateFilter = object.filterByDateTime
      nlgDeparttime = object.namedTimeInChinese
    }
  } else if (dateTimeInterval.length > 0) {
    var object = filterByDateTimeInterval(obj, dateTimeInterval)
    departDateFilter = object.filterByDateTimeInterval
    nlgDeparttime = object.namedTimeInChinese
  } else {
    departDateFilter = obj.dataInfo.filter(function (dataInfo) {
      return dataInfo
    })
  }
  console.log("filterFlights nlgDeparttime" + nlgDeparttime)
  console.log("filterFlights departDateFilter" + departDateFilter.length)

  return {
    departDateFilter: departDateFilter,
    nlgDeparttime: nlgDeparttime
  }
}

function filterByDateTime(obj, dateTime) {
  console.log("filter by DateTime");

  // namedTimeInChinese
  var namedTimeInChinese

  var filterByDateTime
  var departHour = Number(dateTime.time.hour);
  var departMinute = Number(dateTime.time.minute);
  if (departMinute != 0) {
    namedTimeInChinese = departHour + "点" + departMinute + "左右"
  } else {
    namedTimeInChinese = departHour + "点左右"
  }

  var previous;
  if (departHour == 0) {
    previous = 0;
  } else {
    previous = Number((departHour - 1) * 60 + departMinute);
  }
  var after = Number((departHour + 1) * 60 + departMinute);

  console.log("filterByDateTime dataInfo length" + obj.dataInfo.length)
  console.log("filterByDateTime" + namedTimeInChinese)
  console.log(" previous " + previous + " after " + after)
  filterByDateTime = obj.dataInfo.filter(function (dataInfo) {
    var startHour = Number(dataInfo.dt.substr(0, 2));
    var startMinute = Number(dataInfo.dt.substr(3, 2));
    var flightResultDepartTime = Number(startHour * 60 + startMinute);
    if (flightResultDepartTime >= previous && flightResultDepartTime < after) {
      return dataInfo
    }
  })
  return {
    filterByDateTime: filterByDateTime,
    namedTimeInChinese: namedTimeInChinese
  };
}

function filterByDateTimeInterval(obj, dateTimeInterval) {
  console.log("filterByDateTimeInterval");
  var filterByDateTimeInterval
  var departHour;
  var departMinute;
  var flghtResultDepartTime;
  var startHour;
  var startMinute;

  // namedTimeInChinese
  var namedTimeInChinese

  if (dateTimeInterval[0].namedTimeIntervalRel) {
    console.log("+++++filterByDateTimeInterval+++++++++");
    //上午,下午
    var namedTimeIntervalRel = dateTimeInterval[0].namedTimeIntervalRel;
    flghtResultDepartTime = loop.handleDepartTime(namedTimeIntervalRel).transferTime
    namedTimeInChinese = loop.handleDepartTime(namedTimeIntervalRel).namedTimeInChinese
    var start = Number(flghtResultDepartTime.substr(0, 2));
    var end = Number(flghtResultDepartTime.substr(6, 2));
    console.log("++start++" + start + " end" + end);
    filterByDateTimeInterval = obj.dataInfo.filter(function (dataInfo) {
      console.log("dataInfo.dt" + dataInfo.dt)
      var time = Number(dataInfo.dt.substr(0, 2));
      if (time >= start && time < end) {
        return dataInfo
      }
    })
  } else {
    //8点前,8点后
    if (dateTimeInterval[0].end) {
      departHour = Number(dateTimeInterval[0].end.time.hour);
      departMinute = Number(dateTimeInterval[0].end.time.minute);

      if (departMinute != 0) {
        namedTimeInChinese = departHour + "点" + departMinute + "之前"
      } else {
        namedTimeInChinese = departHour + "点前"
      }

      var previous = departHour * 60 + departMinute;

      filterByDateTimeInterval = obj.dataInfo.filter(function (dataInfo) {
        startHour = Number(dataInfo.dt.substr(0, 2));
        startMinute = Number(dataInfo.dt.substr(3, 2));
        flghtResultDepartTime = Number(startHour * 60 + startMinute);
        if (flghtResultDepartTime < previous) {
          return dataInfo
        }
      })
    } else if (dateTimeInterval[1].start) {

      departHour = Number(dateTimeInterval[1].start.time.hour);
      departMinute = Number(dateTimeInterval[1].start.time.minute);

      if (departMinute != 0) {
        namedTimeInChinese = departHour + "点" + departMinute + "以后"
      } else {
        namedTimeInChinese = departHour + "点以后"
      }
      var after = departHour * 60 + departMinute;

      filterByDateTimeInterval = obj.dataInfo.filter(function (dataInfo) {
        startHour = Number(dataInfo.dt.substr(0, 2));
        startMinute = Number(dataInfo.dt.substr(3, 2));
        flghtResultDepartTime = Number(startHour * 60 + startMinute);
        if (flghtResultDepartTime >= after) {
          return dataInfo
        }
      })
    }
  }
  return {
    filterByDateTimeInterval: filterByDateTimeInterval,
    namedTimeInChinese: namedTimeInChinese
  }
}

function compareDepartTime(time, intervalTime) {
  var dur = time.replace(/[^0-9]/ig, " ")
  var array = dur.split(" ")
  for (var i = 0; i < array.length; i++) {
    if (array[i] == '' || array[i] == null || typeof (array[i]) == undefined) {
      array.splice(i, 1)
      i = i - 1
    }
  }
  console.log("time array" + array + "   intervalTime" + intervalTime)
  if (array.length == intervalTime.length && array.length == 2) {
    if ((intervalTime[0] <= array[0] && array[0] < intervalTime[1]) || (array[0] == intervalTime[1] && array[1] == 0)) {
      return true
    }
  }
  return false
}
