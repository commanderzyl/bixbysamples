var Shared = require('lib/shared.js')
var Log = require('lib/log.js')
var Astronomy = require('lib/astronomy.js')

var propertyMap = {
  lowTemperature: {
    id: "mint",
    fn: function (value) {
      return isNaN(value) ? undefined : value
    },
    abbreviation: "C",
    name: "Celsius"
  },
  highTemperature: {
    id: "maxt",
    fn: function (value) {
      return isNaN(value) ? undefined : value
    },
    abbreviation: "C",
    name: "Celsius"
  },
  description: {
    id: "short_comment",
    fn: function (value) {
      var result = value.replace("\n", ", ")
      return result
    }
  },
  temperature: {
    id: "temp",
    fn: function (value) {
      return isNaN(value) ? undefined : value
    },
    abbreviation: "C",
    name: "Celsius"
  },
  apparentTemperature: {
    id: "feeltemp",
    fn: function (value) {
      return isNaN(value) ? undefined : value
    },
    abbreviation: "C",
    name: "Celsius"
  },
  pressure: {
    id: "press",
    fn: function (value) {
      return isNaN(value) ? undefined : value
    },
    abbreviation: "hPa",
    name: "Hectopascal"
  }
}

// parse the response to get the current weather
function getCurrentWeather(point, tempUnitName, root, solarTimes, curLocale, now) {
  Log.debug('getCurrentWeather', point, tempUnitName, root, solarTimes)
  var weather = {
    type: 'Current'
  }

  for (var key in propertyMap) {
    var propConfig = propertyMap[key]
    var value = root[propConfig.id]
    if (value == undefined && root.voice) value = root.voice[propConfig.id]
    Log.debug('getCurrentWeather', key, propConfig, value)

    // Skip bad values, then apply any transform function
    if (!value || /N\/?A/.test(value) || value === -999 || value === -9999) {
      continue
    }
    var propFn = propConfig.fn
    if (propFn) {
      value = propFn(value)
    }

    if (propConfig.name && propConfig.abbreviation) {
      value = Shared.unitBuilder(value, propConfig.abbreviation, propConfig.name)
      if (tempUnitName) {
        value = Shared.convertTemperature(value, tempUnitName)
      }
    }

    weather[key] = Shared.checkValid(value)
  }
  
  // basic info
  var conditionInfo = Shared.getConditionInfo(root.wx, curLocale)
  weather.condition = conditionInfo.condition
  weather.location = point
  weather.when = now.getDateTime()
  weather.icon = Shared.getIcon(conditionInfo.imageIconNumber, weather.when, solarTimes)

  // wind
  weather.wind = Shared.wind(root.detailinfo.wdir.value, root.detailinfo.wspd.value, curLocale)
  if(curLocale == 'zh-CN') {
    weather.windPowerCN = isNaN(root.detailinfo.wndpow.value) ? undefined : root.detailinfo.wndpow.value
  }
  // Relative humidity
  if (root.detailinfo.humi)
    weather.relativeHumidity = isNaN(root.detailinfo.humi.value) ? undefined : root.detailinfo.humi.value
  // UV index
  if (root.detailinfo.uvi) {
    weather.uvi = {
      value: isNaN(root.detailinfo.uvi.value) ? undefined : root.detailinfo.uvi.value,
      level: isNaN(root.detailinfo.uvi.value) ? undefined : root.detailinfo.uvi.value
    }
    if(curLocale == 'zh-CN'){
      var rawvalue = root.detailinfo.uvi.value
      var level 
      if(rawvalue == '最弱') {
        value = 1
        level = 1
      } else if(rawvalue == '弱') {
        value = 2
        level = 2
      } else if(rawvalue == '中等') {
        value = 3
        level = 3
      } else if(rawvalue == '强') {
        value = 4
        level = 4
      } else if(rawvalue == '很强') {
        value = 5
        level = 5
      }
      weather.uvi = {
        value: value,
        level: level
      }
    }
  }
  
  // Visible Distance
  if (root.voice && root.voice.visi) {
    weather.visibleDistance = {
      value: isNaN(root.voice.visi) ? undefined : Shared.unitBuilder(root.voice.visi, "km", "Kilometer"),
      level: isNaN(root.voice.visi) ? undefined : root.voice.visi
    }
  }
  
  // sunrise & sunset time
  weather.sunrise = {
    time: solarTimes.sunrise.time
  }
  weather.sunset = {
    time: solarTimes.sunset.time
  }
  // moonrise & moonset time
  var lunarTimes = Astronomy.parseLunarTimes(root.moonrise, root.moonset, point, weather.when)
  weather.moonrise = {
    time: lunarTimes.moonrise.time
  }
  weather.moonset = {
    time: lunarTimes.moonset.time
  }
  
  // special cases where we mutate more than the value
  if (root.prec && root.prec >= 0) {
    weather.precipitation = Shared.unitBuilder(root.prec, "mm", "Millimeter")
    weather.rainfall = weather.precipitation
    weather.precipitationType = 'Rain'
  } else if (root.voice && root.voice.sprec && root.voice.sprec >= 0) {
    weather.precipitation = Shared.unitBuilder(root.voice.sprec, "cm", "Centimeter")
    weather.snowfall = weather.precipitation
    weather.precipitationType = 'Snow'
  }

  // Calculate temp range
  weather.dailyTemperatureRange = Shared.unitBuilder(weather.highTemperature.value - weather.lowTemperature.value, 
                                  weather.lowTemperature.unit.abbreviation, weather.lowTemperature.unit.name)
  // All temperature & comment
  var temperatureComment = Shared.getTemperatureComment(weather.temperature.value, undefined, undefined, tempUnitName)
  var allTemperature = {
    now: weather.temperature,
    high: weather.highTemperature,
    low: weather.lowTemperature,
    comment: temperatureComment,
    tense: 'Present'
  }
  weather.allTemperature = allTemperature
  
  // Get data for air condition
  if (root.air) {
    if (root.air.pm10) {
      weather.fineDust = {
        value: isNaN(root.air.pm10.value) ? undefined : root.air.pm10.value,
        level: isNaN(root.air.pm10.level) ? undefined : root.air.pm10.level
      }
    }
    if (root.air.pm25) {
      weather.ultraFineDust = {
        value: isNaN(root.air.pm25.value) ? undefined : root.air.pm25.value,
        level: isNaN(root.air.pm25.level) ? undefined : root.air.pm25.level
      }
    }
    if (weather.fineDust && weather.ultraFineDust) {
      weather.dust = {
        fineDust: weather.fineDust,
        ultraFineDust: weather.ultraFineDust
      }
    }
  }
  if (root.voice && root.voice.khai) {
    var value = isNaN(root.voice.khai) ? undefined : root.voice.khai
    var level
    if (value > 250) {
      level = 4;
    } else if (value > 100) {
      level = 3;
    } else if (value > 50) {
      level = 2;
    } else {
      level = 1;
    }
    weather.CAI = {
      value: value,
      level: level
    }
  }
  
  // Get 'hasidx' and link
  var lifeIndex = {
    hasIndex: root.hasidx == '1' ? true : false,
    link: root.urls.index
  }
  weather.lifeIndex = lifeIndex
  
  // life index (carwash, pollen, discomfort)
  if (root.voice && root.voice.lifeindex) {
    if (root.voice.lifeindex.carwash)
      weather.carWashIndex = {
        value: isNaN(root.voice.lifeindex.carwash) ? undefined : root.voice.lifeindex.carwash,
        level: isNaN(root.voice.lifeindex.carwash) ? undefined : root.voice.lifeindex.carwash
      }
    if (root.voice.lifeindex.life_pollen) {
      weather.pollenIndex = {
        value: isNaN(root.voice.lifeindex.life_pollen) ? undefined : root.voice.lifeindex.life_pollen,
        level: isNaN(root.voice.lifeindex.life_pollen) ? undefined : root.voice.lifeindex.life_pollen
      }
    }
    if (root.voice.lifeindex.life_hum) {
      weather.discomfortIndex = {
        value: isNaN(root.voice.lifeindex.life_hum) ? undefined : root.voice.lifeindex.life_hum,
        level: isNaN(root.voice.lifeindex.life_hum) ? undefined : root.voice.lifeindex.life_hum
      }
    }
  }
  if(curLocale == 'zh-CN'){
    if (root.idx_carwash) {
      var rawvalue = root.idx_carwash
      var level 
      if(rawvalue == '适宜') {
        value = 1
        level = 1
      } else if(rawvalue == '较适宜') {
        value = 2
        level = 2
      } else if(rawvalue == '较不宜') {
        value = 3
        level = 3
      } else if(rawvalue == '不宜') {
        value = 4
        level = 4
      }
      weather.carWashIndex = {
        value: value,
        level: level
      }
    }
    weather.clothIndex = root.idx_cloth
    weather.cosmeticIndex = root.idx_cosmetic
    weather.fishingIndex = root.idx_fishing
    weather.trafficIndex = root.idx_traffic
    weather.airdryingIndex = root.idx_dry
    weather.allergyIndex = root.idx_allergy
    weather.coldIndex = root.idx_cold
  }

  return weather
}

exports.getCurrentWeather = getCurrentWeather