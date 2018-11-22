var base = require('./Base.js')
module.exports = {
  getOrderedResult: getOrderedResult,
  compareDepartTime: compareDepartTime,
  getPrivousOrNextDay: getPrivousOrNextDay,
  calculateMinutes: calculateMinutes,
  calculateDepartTime:calculateDepartTime
}

function getPrivousOrNextDay(departTime, someDay) {
  // var departureDate = {}

  var array = []
  var mills
  if (someDay == "TheDayBefore") {
    mills = new dates.ZonedDateTime.of("UTC+08:00", departTime.year, departTime.month, departTime.day).getMillisFromEpoch() - (24 * 60 * 60 * 1000)

  } else {
    mills = new dates.ZonedDateTime.of("UTC+08:00", departTime.year, departTime.month, departTime.day).getMillisFromEpoch() + 24 * 60 * 60 * 1000
  }

  console.log("mills" + mills)

  var dateTime = new dates.ZonedDateTime("UTC+08:00", mills);
  departTime.year = dateTime.getYear()
  departTime.month = dateTime.getMonth()
  departTime.day = dateTime.getDay()
  console.log("departureDate" + departTime.year +"年" + departTime.month +"月"+ departTime.day)
  array.push(departTime)

  return array
}

function getOrderedResult(baseResult, sortStyle) {
  if (sortStyle != undefined) {
    if (sortStyle == "SortByElapsedTime") {
      baseResult.showStyle = "OrderByElapsedTime"
      return orderByElapsedTime(baseResult)
    } else if (sortStyle == "SortByDepartTime") {
      baseResult.showStyle = "OrderByDepartTime"
      return orderByDepartTime(baseResult)
    } else if (sortStyle == "SortByPrice") {
      baseResult.showStyle = "OrderByPrice"
      return orderByPrice(baseResult)
    }
  }
  return -1
}

function orderByPrice(baseResult) {
  var array = baseResult.dataInfo;
  var arr = array.sort(compareFlightPrice("price"))
  baseResult.dataInfo = arr.map(function (item) {

    return {
      type: item.type,
      flightName: item.flightName,
      departTime: item.departTime,
      arriveTime: item.arriveTime,
      from: item.from,
      to: item.to,
      flightIconUrl: item.flightIconUrl,
      price: item.price,
      discount: item.discount,
      date: item.date,
      dur: item.dur,
      flightUrl: item.flightUrl,
      day: item.day,
      lable: item.lable
    }
  })

  return baseResult
}

function compareFlightPrice(property) {
  return function (a, b) {
    var value1 = a[property];
    var value2 = b[property];
    if (value1 == value2) {
      return compareFlightDepartTime(a, b, "departTime")
    }
    return value1 - value2;
  }
}

function compareFlightDepartTime(a, b, property) {

  var value1 = calculateDepartTime(a[property]);
  var value2 = calculateDepartTime(b[property]);

  if (value1.length == value2.length && value1.length == 2) {
    if (value1[0] != value2[0]) {
      return value1[0] - value2[0];
    } else {
      if (value1[1] != value2[1]) {
        return value1[1] - value2[1];
      }
    }
  }
  return 0
}
// sort by depart time
function orderByDepartTime(baseResult) {
  var array = baseResult.dataInfo;
  var arr = array.sort(compareDepartTime("departTime"))
  baseResult.dataInfo = arr.map(function (item) {

    return {
      type: item.type,
      flightName: item.flightName,
      departTime: item.departTime,
      arriveTime: item.arriveTime,
      from: item.from,
      to: item.to,
      flightIconUrl: item.flightIconUrl,
      price: item.price,
      discount: item.discount,
      date: item.date,
      dur: item.dur,
      flightUrl: item.flightUrl,
      day: item.day,
      lable: item.lable
    }
  })

  return baseResult
}

function compareDepartTime(property) {
  return function (a, b) {
    var value1 = calculateDepartTime(a[property]);
    var value2 = calculateDepartTime(b[property]);

    if (value1.length == value2.length && value1.length == 2) {
      if (value1[0] != value2[0]) {
        return value1[0] - value2[0];
      } else {
        if (value1[1] != value2[1]) {
          return value1[1] - value2[1];
        } else {
          return comparePrice(a, b, "price")
        }
      }
    }
    return 0;
  }
}

function calculateDepartTime(departTime) {
  var time = departTime.replace(/[^0-9]/ig, " ");
  var array = time.split(" ");
  for (var i = 0; i < array.length; i++) {
    if (array[i] == '' || array[i] == null || typeof (array[i]) == undefined) {
      array.splice(i, 1);
      i = i - 1;
    }
  }

  return array
}

// sort by elapsed time.
function orderByElapsedTime(baseResult) {

  var array = baseResult.dataInfo;
  var arr = array.sort(compareElapsedTime("dur"))
  baseResult.dataInfo = arr.map(function (item) {

    return {
      type: item.type,
      flightName: item.flightName,
      departTime: item.departTime,
      arriveTime: item.arriveTime,
      from: item.from,
      to: item.to,
      flightIconUrl: item.flightIconUrl,
      price: item.price,
      discount: item.discount,
      date: item.date,
      dur: item.dur,
      flightUrl: item.flightUrl,
      day: item.day,
      lable: item.lable
    }
  })

  return baseResult
}

function compareElapsedTime(property) {
  return function (a, b) {
    var value1 = calculateMinutes(a[property]);
    var value2 = calculateMinutes(b[property]);
    if (value1 == value2) {
      return comparePrice(a, b, "price")
    }
    return value1 - value2;
  }
}

function comparePrice(a, b, property) {
  var price1 = a[property]
  var price2 = b[property]
  return price1 - price2
}

function calculateMinutes(elapsedTime) {
  var dur = elapsedTime.replace(/[^0-9]/ig, " ");
  var array = dur.split(" ");
  for (var i = 0; i < array.length; i++) {
    if (array[i] == '' || array[i] == null || typeof (array[i]) == undefined) {
      array.splice(i, 1);
      i = i - 1;
    }
  }

  var minutes = 0
  if (array.length == 1) {
    minutes = parseInt(array[0])
  } else if (array.length == 2) {
    minutes = 60 * array[0] + parseInt(array[1]);
  }
  return minutes
}
