// ************************************************************
// compare.js
//
// Implemented Functions: comapreTemperature()
//
// Author: Alex Lee
// ************************************************************
var Shared = require('lib/shared.js')
var Log = require('lib/log.js')

var API_BASE_KR = "https://galaxy.wni.com/api_v2/"
var TEST_API_BASE_KR = "https://galaxy.wni.com/api_v2_test/"
var API_BASE_CN = "https://api.cn-weathernews.cn/api/"

var onlyKR = false;

function getLocation (curLocale, root) {
  var displayLocation
  if(curLocale == 'ko-KR'){
    if (root.country_en == 'South Korea') {
      displayLocation = root.state_ko + " " + root.city_ko
      onlyKR = true;
    } else {
      if (root.country_ko == root.city_ko) {
        displayLocation = root.city_ko
      } else {
        displayLocation = root.country_ko + " " + root.city_ko
      }
    }
  } else {
    if(root.state_cn == root.city_cn) {
      displayLocation = root.city_cn
    } else {
      displayLocation = root.state_cn + root.city_cn
    }
  }
  return displayLocation
}

function getForecast (root) {
  var forecastDays = []
  if (root.day0) {
    forecastDays.push(root.day0)
  }
  if (root.day1) {
    forecastDays.push(root.day1)
  }
  if (root.day2) {
    forecastDays.push(root.day2)
  }
  if (root.day3) {
    forecastDays.push(root.day3)
  }
  if (root.day4) {
    forecastDays.push(root.day4)
  }
  if (root.day5) {
    forecastDays.push(root.day5)
  }
  if (root.day6) {
    forecastDays.push(root.day6)
  }
  if (root.day7) {
    forecastDays.push(root.day7)
  }
  if (root.day8) {
    forecastDays.push(root.day8)
  }
  if (root.day9) {
    forecastDays.push(root.day9)
  }
  return forecastDays
}

function compareWeather (where, date, comparedDate, $vivContext) {
  Log.debug("compareWeather", where, date, comparedDate, $vivContext)
  if (date == undefined && comparedDate == undefined) {
    throw fail.checkedError("missing location", "MissingLocus")
  }
  var curLocale = $vivContext.locale
  var point = where && where.point
  var latitude = point && point.latitude
  var longitude = point && point.longitude
  if (!latitude || !longitude) {
    throw fail.checkedError("missing location", "NullLocation")
  }
  
  var today = dates.ZonedDateTime.now(point).atStartOfDay()
  var localTimeZone = today.getTimeZoneId()
  var yesterday = today.minusDays(1)
  var limitDay
  if (localTimeZone == 'Asia/Seoul') {
    limitDay = today.plusDays(10).atEndOfDay()
  } else {
    limitDay = today.plusDays(6).atEndOfDay()
  }
  
  var hasYesterday = false
  var dateZdt
  var comparedDateZdt
  if (date && comparedDate) {
    comparedDateZdt = dates.ZonedDateTime.fromDate(comparedDate).atStartOfDay()
    dateZdt = dates.ZonedDateTime.fromDate(date).atStartOfDay()
  } else if (!date) {
    comparedDateZdt = dates.ZonedDateTime.fromDate(comparedDate).atStartOfDay()
    if (comparedDateZdt.isEqualTo(today)) {
      dateZdt = today.plusDays(1)  // tomorrow
    } else {
      dateZdt = today
    }
    var dateTime = dateZdt.getDateTime();
    date = {
      year: dateTime.date.year,
      month: dateTime.date.month,
      day: dateTime.date.day
    }
  } else if (!comparedDate) {
    dateZdt = dates.ZonedDateTime.fromDate(date).atStartOfDay()
    if (dateZdt.isEqualTo(today)) {
      comparedDateZdt = yesterday
    } else {
      comparedDateZdt = today
    }
    var dateTime = comparedDateZdt.getDateTime();
    comparedDate = {
      year: dateTime.date.year,
      month: dateTime.date.month,
      day: dateTime.date.day
    }
  }
  if (dateZdt.isEqualTo(yesterday) || comparedDateZdt.isEqualTo(yesterday)) {
    hasYesterday = true
  }
  Log.debug("compareWeather", date, comparedDate)
  
  if (dateZdt.isBefore(yesterday) || dateZdt.isAfter(limitDay) || comparedDateZdt.isBefore(yesterday) || comparedDateZdt.isAfter(limitDay)) {
    return
  }
  
  var weather = {}
  var url, urlYesterday, response, responseYesterday
  switch (curLocale) {
    case 'ko-KR':
      url = API_BASE_KR + "weather.cgi"
      urlYesterday = API_BASE_KR + "yesterday.cgi"
      break;
    case 'zh-CN':
      url = API_BASE_CN + "weather.cgi"
      urlYesterday = API_BASE_CN + "yesterday.cgi"
      break;
  }
  response = http.getUrl(url, {
    format: 'json',
    query: {
      lat: point.latitude,
      lon: point.longitude
    },
    cacheTime: 10 * 60 * 1000 // 5 minutes
  })
  if (hasYesterday) {
    responseYesterday = http.getUrl(urlYesterday, {
      format: 'json',
      query: {
        lat: point.latitude,
        lon: point.longitude
      },
      cacheTime: 10 * 60 * 1000 // 5 minutes
    })
  }
  if (response[0] == undefined) {
    throw fail.checkedError("no weather locus", "MissingLocus")
  }
  
  var root = response[0]
  var displayLocation = getLocation(curLocale, root)
  
  if (date.month < 10) {
    date.month = '0' + date.month
  }
  if (date.day < 10) {
    date.day = '0' + date.day
  }
  if (comparedDate.month < 10) {
    comparedDate.month = '0' + comparedDate.month
  }
  if (comparedDate.day < 10) {
    comparedDate.day = '0' + comparedDate.day
  }
  var dateText = date.year + '' + date.month + '' + date.day
  var comparedDateText = comparedDate.year + '' + comparedDate.month + '' + comparedDate.day
  var dateWeather = new Object()
  var comparedDateWeather = new Object()
  
  // check yesterday info
  var isPast = false
  var conditionInfo
  var weatherInformation
  if (hasYesterday) {
    var yesterdayDate = responseYesterday[0].hour[0].date
    Log.debug("compareWeather", yesterdayDate)
    conditionInfo = Shared.getConditionInfo(responseYesterday[0].wx, curLocale)
    weatherInformation = {
      high: Shared.convertTemperature(Shared.unitBuilder(responseYesterday[0].maxt, "C", "Celsius")),
      low: Shared.convertTemperature(Shared.unitBuilder(responseYesterday[0].mint, "C", "Celsius")),
      icon: Shared.getIcon(conditionInfo.imageIconNumber)
    }
    if (dateText == yesterdayDate) {
      dateWeather = weatherInformation
      dateWeather.dateTime = dateZdt.getDateTime()
      isPast = true
    } else if (comparedDateText == yesterdayDate) {
      comparedDateWeather = weatherInformation
      comparedDateWeather.dateTime = comparedDateZdt.getDateTime()
    }
  }
  
  // check today info
  var todayDate = root.date
  Log.debug("compareWeather", todayDate)
  conditionInfo = Shared.getConditionInfo(root.wx, curLocale)
  var precipitation
  if (root.prec && root.prec >= 0) {
    precipitation = Shared.unitBuilder(root.prec, "mm", "Millimeter")
  } else if (root.voice && root.voice.sprec && root.voice.sprec >= 0) {
    weather.precipitation = Shared.unitBuilder(root.voice.sprec, "cm", "Centimeter")
  }
  weatherInformation = {
    high: Shared.convertTemperature(Shared.unitBuilder(root.maxt, "C", "Celsius")),
    low: Shared.convertTemperature(Shared.unitBuilder(root.mint, "C", "Celsius")),
    icon: Shared.getIcon(conditionInfo.imageIconNumber),
    precipitation: precipitation
  }
  if (dateText == todayDate) {
    dateWeather = weatherInformation
    dateWeather.dateTime = dateZdt.getDateTime()
  } else if (comparedDateText == todayDate) {
    comparedDateWeather = weatherInformation
    comparedDateWeather.dateTime = comparedDateZdt.getDateTime()
  }

  // check forecast info
  var forecastDate = ''
  var forecastYear
  var currentYear = forecastYear = root.date.substr(0,4)
  var currentMonth = root.date.substr(4,2)
  var changedYear = false
  var forecastDays = getForecast(root)
  for (var i = 0; i < forecastDays.length; i++) {
    var forecast = forecastDays[i]
    if (!changedYear && forecast.mon < currentMonth) {
      forecastYear = Number(currentYear) + 1
      changedYear = true;
    }
    
    if (forecast.mon < 10) {
      forecast.mon = '0' + forecast.mon
    }
    if (forecast.day < 10) {
      forecast.day = '0' + forecast.day
    }
    forecastDate = forecastYear + '' + forecast.mon + '' + forecast.day
    Log.debug("compareWeather", "forecastDate", i, forecastDate)
    conditionInfo = Shared.getConditionInfo(forecast.wx_day, curLocale)
    weatherInformation = {
      high: Shared.convertTemperature(Shared.unitBuilder(forecast.maxt, "C", "Celsius")),
      low: Shared.convertTemperature(Shared.unitBuilder(forecast.mint, "C", "Celsius")),
      icon: Shared.getIcon(conditionInfo.imageIconNumber),
      probabilityOfPrecipitation: forecast.pop
    }
    if (dateText == forecastDate) {
      dateWeather = weatherInformation
      dateWeather.dateTime = dateZdt.getDateTime()
    } else if (comparedDateText == forecastDate) {
      comparedDateWeather = weatherInformation
      comparedDateWeather.dateTime = comparedDateZdt.getDateTime()
    }
  }
  
  var diffLowTemp = Shared.convertTemperature(Shared.unitBuilder(dateWeather.low.value - comparedDateWeather.low.value, "C", "Celsius"))
  var diffHighTemp = Shared.convertTemperature(Shared.unitBuilder(dateWeather.high.value - comparedDateWeather.high.value, "C", "Celsius"))

  var absDiffLowTemp = {
    value: Math.abs(diffLowTemp.value),
    unit: diffLowTemp.unit
  }
  var absDiffHighTemp = {
    value: Math.abs(diffHighTemp.value),
    unit: diffHighTemp.unit
  }
  
  Log.debug("compareWeather", "dateWeather", dateWeather, "comparedDateWeather", comparedDateWeather)
  Log.debug('compareWeather', diffLowTemp, diffHighTemp, absDiffLowTemp, absDiffHighTemp)
  
  return {
    displayLocation: displayLocation,
    diffLowTemp: diffLowTemp,
    diffHighTemp: diffHighTemp,
    absDiffLowTemp: absDiffLowTemp,
    absDiffHighTemp: absDiffHighTemp,
    dateWeather: dateWeather,
    comparedDateWeather: comparedDateWeather,
    isPast: isPast,
    onlyKR: onlyKR,
    link: root.urls.hourly
  }
}

module.exports = {
  compareWeather: compareWeather
}