var Log = require('lib/log.js')

// shared code for weather
var AlertType = {
  HUR: "HurricaneLocalStatement",
  TOR: "TornadoWarning",
  TOW: "TornadoWatch",
  WRN: "SevereThunderstormWarning",
  SEW: "SevereThunderstormWatch",
  WIN: "WinterWeatherAdvisory",
  FLO: "FloodWarning",
  WAT: "FloodWatch",
  WND: "HighWindAdvisory",
  SVR: "SevereWeatherStatement",
  HEA: "HeatAdvisory",
  FOG: "DenseFogAdvisory",
  SPE: "SpecialWeatherStatement",
  FIR: "FireWeatherAdvisory",
  VOL: "VolcanicActivityStatement",
  HWW: "HurricaneWindWarning",
  REC: "RecordSet",
  REP: "PublicReports",
  PUB: "PublicInformationStatement"
}

var WIND_DIRECTIONS = [
  'N', 'NE', 'E', 'SE',
  'S', 'SW', 'W', 'NW', 'N' 
]

var WIND_DIRECTIONS_CN = [
  'NWD', 'NE', 'E', 'SE',
  'S', 'SW', 'W', 'NW', 'N', 'WWD'
]

var WEATHER_CONDITION_ICON_MAP_CN = {
  "00": {condition: "Sunny", icon:0 },
  "01": {condition: "Cloudy", icon:1 },
  "02": {condition: "Overcast", icon:2 },
  "03": {condition: "Shower", icon:7 },
  "04": {condition: "Thundershower", icon:9 },
  "05": {condition: "Thundershowerwithhail", icon:9 },
  "06": {condition: "Sleet", icon: 15},
  "07": {condition: "Lightrain", icon:6 },
  "08": {condition: "Moderaterain", icon:6 },
  "09": {condition: "Heavyrain", icon:6 },
  "10": {condition: "Storm", icon:4 },
  "11": {condition: "Heavystorm", icon:4 },
  "12": {condition: "Severestorm", icon:4 },
  "13": {condition: "Snowflurry", icon:13 },
  "14": {condition: "Lightsnow", icon:13 },
  "15": {condition: "Moderatesnow", icon:13 },
  "16": {condition: "Heavysnow", icon:16 },
  "17": {condition: "Snowstorm", icon:16 },
  "18": {condition: "Foggy", icon:3 },
  "19": {condition: "Icerain", icon:10 },
  "20": {condition: "Duststorm", icon:25 },
  "21": {condition: "Lighttomoderaterain", icon:10 },
  "22": {condition: "Moderatetoheavyrain", icon:10 },
  "23": {condition: "Heavyraintostorm", icon:6 },
  "24": {condition: "Stormtoheavystorm", icon:4 },
  "25": {condition: "Heavytoseverestorm", icon:4 },
  "26": {condition: "Lighttomoderatesnow", icon:13 },
  "27": {condition: "Moderatetoheavysnow", icon:13 },
  "28": {condition: "Heavysnowtosnowstorm", icon:13 },
  "29": {condition: "Dust", icon:24 },
  "30": {condition: "Sand", icon:27 },
  "31": {condition: "Sandstorm", icon:28 },
  "53": {condition: "Haze", icon:26 },
  "99": {condition: "Unknown", icon:0 },
  "32": {condition: "Densefog", icon:3 },
  "49": {condition: "Strongfog", icon:3 },
  "54": {condition: "Moderatehaze", icon:26 },
  "55": {condition: "Severehaze", icon:26 },
  "56": {condition: "Severehaze", icon:26 },
  "57": {condition: "Densefog", icon:3 },
  "58": {condition: "Extraheavyfog", icon:3 },
  "301": {condition: "rain", icon:6 },
  "302": {condition: "snow", icon:13 }
}

var COLD_COOL_CENTER = 3.89
var COOL_WARM_CENTER = 15
var WARM_HOT_CENTER = 26.1
var F_COLD_COOL_CENTER = 39
var F_COOL_WARM_CENTER = 59
var F_WARM_HOT_CENTER = 79

var unitMap = {
  Celsius: {
    Celsius: function (value) {
      return value;
    },
    Fahrenheit: function (value) {
      return ((value * 9 / 5) + 32).toFixed(1);
    },
    Kelvin: function (value) {
      return (parseFloat(value) + 273.15).toFixed(1);
    }
  },
  Fahrenheit: {
    Celsius: function (value) {
      return ((value - 32) * 5 / 9).toFixed(1);
    },
    Fahrenheit: function (value) {
      return value;
    },
    Kelvin: function (value) {
      return ((parseFloat(value) + 459.67) * 5 / 9).toFixed(1);
    }
  },
  Kelvin: {
    Celsius: function (value) {
      return (value - 273.15).toFixed(1);
    },
    Fahrenheit: function (value) {
      return ((value * 9 / 5) - 459.67).toFixed(1);
    },
    Kelvin: function (value) {
      return value;
    }
  }
}

exports.calculateDailyPositionXY = function calculateDailyPositionXY(results, tempUnitName) {
  var start
  var dx
  var length
  if (results.length == 7) {
    start = 28
    dx = 56.5
    length = 7
  } else if (results.length == 6) {
    start = 32.5
    dx = 66
    length = 6
  } else if (results.length == 5) {
    start = 39.5
    dx = 79.2
    length = 5
  } else if (results.length == 4) {
    start = 49.5
    dx = 99
    length = 4
  } else if (results.length == 3) {
    start = 66
    dx = 132
    length = 3
  } else {
    return
  }
  
  // for test
  // results[0].highTemperature.value = 61
  // results[1].highTemperature.value = 65
  // results[2].highTemperature.value = 69
  // results[3].highTemperature.value = 75
  // results[4].highTemperature.value = 81
  // results[5].highTemperature.value = 44

  var highMax = -999
  var highMin = 999
  var intHighTemp
  
  var lowMax = -999
  var lowMin = 999
  var intLowTemp
  for (var i=0; i<length; i++) {
    results[i].highPositionX = start + (i * dx)
    results[i].lowPositionX = start + (i * dx)
    
    intHighTemp = Number(results[i].highTemperature.value)
    intLowTemp = Number(results[i].lowTemperature.value)
    if (intHighTemp > highMax) {
      highMax = intHighTemp
    }
    if (intHighTemp < highMin) {
      highMin = intHighTemp
    }
    
    if (intLowTemp > lowMax) {
      lowMax = intLowTemp
    }
    if (intLowTemp < lowMin) {
      lowMin = intLowTemp
    }
  }
  
  var highRange = highMax - highMin
  var lowRange = lowMax - lowMin
  var highY
  var lowY
  if (tempUnitName == 'Fahrenheit') {
    if (highRange >= 0 && highRange <= 5) {
      highY = 6.25
    } else if (highRange <= 10) {
      highY = 2.5
    } else if (highRange <= 15) {
      highY = 1.25
    } else if (highRange <= 20) {
      highY = 0.75
    } else {
      highY = 0.5
    }
    if (lowRange >= 0 && lowRange <= 5) {
      lowY = 6.25
    } else if (lowRange <= 10) {
      lowY = 2.5
    } else if (lowRange <= 15) {
      lowY = 1.25
    } else if (lowRange <= 20) {
      lowY = 0.75
    } else {
      lowY = 0.5
    }
    for (var i=0; i<length; i++) {
      results[i].highPositionY = 85 - (highY * 2) - (results[i].highTemperature.value - highMin) * highRange / 5.6 * highY
      results[i].lowPositionY = 170 - (lowY * 2) - (results[i].lowTemperature.value - lowMin) * lowRange / 5.6 * lowY
    }
  } else {
    if (highRange >= 0 && highRange <= 3) {
      highY = 10
    } else if (highRange <= 6) {
      highY = 4
    } else if (highRange <= 9) {
      highY = 2
    } else if (highRange <= 12) {
      highY = 1.2
    } else {
      highY = 0.9
    }
    if (lowRange >= 0 && lowRange <= 3) {
      lowY = 10
    } else if (lowRange <= 6) {
      lowY = 4
    } else if (lowRange <= 9) {
      lowY = 2
    } else if (lowRange <= 12) {
      lowY = 1.2
    } else {
      lowY = 0.9
    }
    for (var i=0; i<length; i++) {
      results[i].highPositionY = 85 - (highY * 2) - (results[i].highTemperature.value - highMin) * highRange / 3.5 * highY
      results[i].lowPositionY = 170 - (lowY * 2) - (results[i].lowTemperature.value - lowMin) * lowRange / 3.5 * lowY
    }
  }
}

exports.calculateHourlyPositionXY = function calculateHourlyPositionXY(results, tempUnitName) {
  var start
  var dx
  var length
  if (results.length >= 6) {
    start = 32.5
    dx = 66
    length = 6
  } else if (results.length == 5) {
    start = 39.5
    dx = 79.2
    length = 5
  } else if (results.length == 4) {
    start = 49.5
    dx = 99
    length = 4
  } else if (results.length == 3) {
    start = 66
    dx = 132
    length = 3
  } else {
    return
  }

  // for test
  // results[0].temperature.value = 0
  // results[1].temperature.value = 1
  // results[2].temperature.value = 2
  // results[3].temperature.value = 21
  // results[4].temperature.value = 2
  // results[5].temperature.value = 1
  
  
  var max = -999
  var min = 999
  var intTemp
  for (var i=0; i<length; i++) {
    results[i].positionX = start + (i * dx)
    intTemp = Number(results[i].temperature.value)
    if (intTemp > max) {
      max = intTemp
    }
    if (intTemp < min) {
      min = intTemp
    }
  }
  
  var range = max - min
  var y
  if (tempUnitName == 'Fahrenheit') {
    if (range >= 0 && range <= 5) {
      y = 12.5
    } else if (range <= 10) {
      y = 5
    } else if (range <= 15) {
      y = 2.5
    } else if (range <= 20) {
      y = 1.25
    } else if (range <= 25) {
      y = 0.95
    } else if (range <= 30) {
      y = 0.67
    } else {  // it's possible until range = 38
      y = 0.4
    }
    for (var i=0; i<length; i++) {
      results[i].positionY = 130 - (y * 2) - (results[i].temperature.value - min) * range / 5.6 * y
    }
  }
  else {
    if (range >= 0 && range <= 3) {
      y = 20
    } else if (range <= 6) {
      y = 8
    } else if (range <= 9) {
      y = 4
    } else if (range <= 12) {
      y = 2
    } else if (range <= 15) {
      y = 1.5
    } else if (range <= 18) {
      y = 1.1
    } else {  // it's possible until range = 21
      y = 0.8
    }
    for (var i=0; i<length; i++) {
      results[i].positionY = 130 - (y * 2) - (results[i].temperature.value - min) * range / 3.5 * y
    }
  }
}

exports.calRange = function calRange(high, low, tempUnitName) {
  var tempRangeValue = high.value - low.value
  tempRangeValue = Shared.unitBuilder(tempRangeValue, high.unit.abbreviation, high.unit.name)
  if (tempUnitName) {
    tempRangeValue = Shared.convertTemperature(tempRangeValue, tempUnitName)
  }
  return Shared.checkValid(tempRangeValue)
}

function checkValid(value) {
  if ((value == -999) || (value == -9999)) {
    return undefined
  } else {
    return value
  }
}

exports.convertTemperature = function (temp, toUnitName) {
  if (!temp || !temp.unit) {
    return temp
  }
  if (unitMap[temp.unit.name] && toUnitName) {
    return unitBuilder(Math.round(unitMap[temp.unit.name][toUnitName](temp.value)), null, toUnitName)
  }
  return temp
}

exports.dateInterval = function dateInterval(start, end) {
  return {
    "start": {
      "year": start.year,
      "month": start.month,
      "day": start.day,
      "$type": "time.StartingDate"
    },
    "end": {
      "year": end.year,
      "month": end.month,
      "day": end.day,
      "$type": "time.EndingDate"
    },
    "$id": null,
    "$type": "time.DateInterval"
  }
}

exports.getConditionInfo = function getConditionInfo(iconCode, curLocale) {
  Log.debug("getConditionInfo", iconCode)
  var condition
  var strCondition
  var imageIconNumber
  //for cp response, overseas iconcode: undefine, cn iconcode: 00~99
  if(iconCode === undefined)
    iconCode = '1';
  if(curLocale == "zh-CN") {
    condition = WEATHER_CONDITION_ICON_MAP_CN[iconCode].condition
    imageIconNumber = WEATHER_CONDITION_ICON_MAP_CN[iconCode].icon
  } else {
    switch (iconCode) {
      case '0':
      case '1':
        condition = "Sunny"
        imageIconNumber = "0"
        break;
      case '2':
        condition = "Partlycloudy"
        imageIconNumber = "1"
        break;
      case '3':
        condition = "Mostlycloudy"
        imageIconNumber = "2"
        break;
      case '4':
        condition = "Cloudy"
        imageIconNumber = "2"
        break;
      case '5':
        condition = "Coludythenclearing"
        imageIconNumber = "1"
        break;
      case '6':
        condition = "Sunnythencloudingover"
        imageIconNumber = "1"
        break;
      case '7':
        condition = "Mostlycloudywithshowers"
        imageIconNumber = "5"
        break;
      case '8':
      case '9':
        condition = "Mostlycloudywithshowers"
        imageIconNumber = "6"
        break;
      case '10':
      case '11':
      case '12':
        condition = "Rain"
        imageIconNumber = "4"
        break;
      case '13':
      case '14':
        condition = "Becomingcloudywithrain"
        imageIconNumber = "4"
        break;
      case '15':
      case '16':
      case '17':
        condition = "Rainythenclearing"
        imageIconNumber = "7"
        break;
      case '18':
      case '19':
      case '20':
        condition = "Snow"
        imageIconNumber = "13"
        break;
      case '21':
      case '22':
        condition = "Becomingcloudywithsnow"
        imageIconNumber = "14"
        break;
      case '23':
      case '24':
      case '25':
        condition = "Snowthenclearing"
        strCondition = "눈 온 후 갬"
        imageIconNumber = "12"
        break;
      case '26':
      case '27':
      case '28':
      case '31':
      case '32':
      case '33':
        condition = "Rainorsnow"
        imageIconNumber = "15"
        break;
      case '29':
      case '30':
      case '34':
      case '35':
        condition = "Becomingcloudywithrainorsnow"
        imageIconNumber = "15"
        break;
      case '36':
      case '37':
      case '38':
        condition = "Snoworrainthenclearing"
        imageIconNumber = "15"
        break;
      case '39':
        condition = "Thunderstorms"
        imageIconNumber = "8"
        break;
      case '40':
        condition = "Fog"
        imageIconNumber = "3"
        break;
    }
  }
  
  return {
    strCondition : strCondition,
    condition : condition,
    imageIconNumber : imageIconNumber
  }
}

function getIcon(iconCode, dateTime, solarTimes) {
  var icon = null
  var isDay = true
  if (dateTime && solarTimes && solarTimes.sunrise && solarTimes.sunset) {
    // solarTimes may be for a different day!
    // Timezone should be the same, and all we care about is the hour.
    var when = dates.ZonedDateTime.fromDateTime(dateTime)
    var whenMinute = when.getHour() * 60 + when.getMinute()
    
    var sunriseHour = solarTimes.sunrise.time && solarTimes.sunrise.time.time.hour || 6
    var sunsetHour = solarTimes.sunset.time && solarTimes.sunset.time.time.hour || 18
    var sunriseMinute = solarTimes.sunrise.time && solarTimes.sunrise.time.time.minute || 0
    var sunsetMinute = solarTimes.sunset.time && solarTimes.sunset.time.time.minute || 0
    var sunriseSumMinute = sunriseHour * 60 + sunriseMinute * 1
    var sunsetSumMinute = sunsetHour * 60 + sunsetMinute * 1

    isDay = (whenMinute >= sunriseSumMinute && whenMinute <= sunsetSumMinute)
    Log.debug('getIcon', dateTime, solarTimes, when, sunriseSumMinute, whenMinute, sunsetSumMinute, isDay)
  }

  if (iconCode == '0' || iconCode == '1' || iconCode == '7' || iconCode == '9' || iconCode == '12' || iconCode == '17') {
    if (!isDay) {
      iconCode = iconCode + '_Night'
    }
  }
  
  return {
    size: "icon",
    url: 'images/conditions/Icon_WeatherKR_Solid_' + iconCode + '.png'
  }
}

exports.getTemperatureComment = function (nowTemp, highTemp, lowTemp, tempUnitName) {
  var comment
  if (tempUnitName == 'Fahrenheit') {
    if (nowTemp) {
      if (nowTemp > F_WARM_HOT_CENTER) {
        comment = "hot"
      } else if (nowTemp > F_COOL_WARM_CENTER) {
        comment = "warm"
      } else if (nowTemp > F_COLD_COOL_CENTER) {
        comment = "cool"
      } else {
        comment = "cold"
      }
    } else {
      if (highTemp > F_WARM_HOT_CENTER) {
        comment = "hot"
      } else if (highTemp > F_COOL_WARM_CENTER) {
        comment = "warm"
      } else if (lowTemp > F_COLD_COOL_CENTER) {
        comment = "cool"
      } else if (lowTemp <= F_COLD_COOL_CENTER) {
        comment = "cold"
      }
    }
  } else {
    if (nowTemp) {
      if (nowTemp > WARM_HOT_CENTER) {
        comment = "hot"
      } else if (nowTemp > COOL_WARM_CENTER) {
        comment = "warm"
      } else if (nowTemp > COLD_COOL_CENTER) {
        comment = "cool"
      } else {
        comment = "cold"
      }
    } else {
      if (highTemp > WARM_HOT_CENTER) {
        comment = "hot"
      } else if (highTemp > COOL_WARM_CENTER) {
        comment = "warm"
      } else if (lowTemp > COLD_COOL_CENTER) {
        comment = "cool"
      } else if (lowTemp <= COLD_COOL_CENTER) {
        comment = "cold"
      }
    }
  }
  
  Log.debug("[Shared] getTemperatureComment", nowTemp, highTemp, lowTemp, comment)
  return comment
}

// developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
exports.objectAssign = function objectAssign(target) {
  'use strict'
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }

  var output = Object(target)
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index]
    if (source !== undefined && source !== null) {
      for (var nextKey in source) {
        if (source.hasOwnProperty(nextKey)) {
          output[nextKey] = source[nextKey]
        }
      }
    }
  }
  return output
}

function unitBuilder(value, abbreviation, name) {
  if (typeof value === 'undefined' || value == null) {
    return null
  }
  if (typeof value === 'string' && value.trim() === '') {
    return null
  }
  if (Number.isNaN(value)) {
    return null
  }
  var result = {
    unit: {},
    value: value
  }
  if (abbreviation) {
    result.unit.abbreviation = abbreviation
  }
  if (name) {
    result.unit.name = name
  }
  return result
}

exports.wind = function wind(windDegreesRaw, speedValue, curLocale) {
  // don't return wind if there isn't any
  if (!checkValid(speedValue)) {
    return null
  }
  if (!windDegreesRaw) {
    return null
  }
  var windDirection
  if(curLocale == 'zh-CN') {
    windDirection = WIND_DIRECTIONS_CN[windDegreesRaw]
  } else {
    var idx = Math.max(0, Math.round(windDegreesRaw / (360 / WIND_DIRECTIONS.length)) - 1)
    windDirection = WIND_DIRECTIONS[idx]
  }
  Log.debug('wind: inferring direction from degrees', windDegreesRaw, idx, windDirection)

  return {
    speed: {
      value: speedValue,
      unit: {
        abbreviation: 'mps'
      }
    },
    direction: {
      cardinal: windDirection,
      azimuth: {
        value: windDegreesRaw,
        unit: {
          abbreviation: "deg"
        }
      }
    }
  }
}


exports.checkValid = checkValid
exports.getIcon = getIcon
exports.unitBuilder = unitBuilder