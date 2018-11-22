var Shared = require('lib/shared.js')
var Log = require('lib/log.js')

function getHistoricalHourlyWeather(where, tempUnitName, root, solarTimes, curLocale, now) {
  Log.debug('getHistoricalHourlyWeather', where, tempUnitName, 'root', root)
  if (!root.hour) {
    return
  }
  
  var timeZone = now.getTimeZoneId()
  var date = {
    year: root.hour[0].date.substr(0, 4),
    month: root.hour[0].date.substr(4, 2),
    day: root.hour[0].date.substr(6, 2)
  }
  
  var hourly = []
  var hourlyWeatherData, when, temperature, conditionInfo, hourlyWeather
  for (var i=2; i<root.hour.length; i++) {
    hourlyWeatherData = root.hour[i]
    when = {
      date: date,
      time: {
        hour: hourlyWeatherData.hour,
        minute: 0,
        second: 0,
        timezone: timeZone
      }
    }
    
    temperature = Shared.convertTemperature(Shared.unitBuilder(hourlyWeatherData.temp, 'C', 'Celsius'), tempUnitName)
    conditionInfo = Shared.getConditionInfo(hourlyWeatherData.wx, curLocale)
    hourlyWeather = {
      $id: 100+i,
      location: where,
      when: when,
      type: "Hourly",
      condition: conditionInfo.condition,
      description : conditionInfo.strCondition,
      temperature: temperature,
      wind: Shared.wind(hourlyWeatherData.wdir, hourlyWeatherData.wspd),
      icon: Shared.getIcon(conditionInfo.imageIconNumber, when, solarTimes)
    }

    hourly.push(hourlyWeather)
  }
  
  Shared.calculateHourlyPositionXY(hourly, tempUnitName)
  return hourly
}

// parse the response to get the historical weather
function getHistoricalWeather(where, tempUnitName, dateOpts, root, curLocale) {
  Log.debug('getHistoricalWeather', where, tempUnitName, 'dateOpts', dateOpts, 'root', root)
  if (!root) {
    console.warn('getHistoricalWeather: no data')
    return null
  }
  
  var yesterdayYear = root.hour[0].date.substr(0,4)
  var yesterdayMonth = root.hour[0].date.substr(4,2)
  var yesterdayDay = root.hour[0].date.substr(6,2)

  var results = []
  var when = {
    year: yesterdayYear,
    month: yesterdayMonth,
    day: yesterdayDay
  }
  
  var tempHigh = Shared.checkValid(parseInt(root.maxt))
  var tempLow = Shared.checkValid(parseInt(root.mint))
  var highTemperature = Shared.convertTemperature(Shared.unitBuilder(tempHigh, "C", "Celsius"), tempUnitName)
  var lowTemperature = Shared.convertTemperature(Shared.unitBuilder(tempLow, "C", "Celsius"), tempUnitName)
  var temperatureComment = Shared.getTemperatureComment(undefined, highTemperature.value, lowTemperature.value, tempUnitName)
  var allTemperature = {
    high: highTemperature,
    low: lowTemperature,
    comment: temperatureComment,
    tense: 'Past'
  }
  
  var tempRange = tempHigh - tempLow
  var avgTemp = Math.round((tempHigh + tempLow) / 2)
  var conditionInfo = Shared.getConditionInfo(root.wx, curLocale)

  var weather = {
    location: where,
    when: when,
    type: "Historical",
    condition: conditionInfo.condition,
    description: conditionInfo.strCondition,
    temperature: Shared.convertTemperature(Shared.unitBuilder(avgTemp, "C", "Celsius"), tempUnitName),
    lowTemperature: lowTemperature,
    highTemperature: highTemperature,
    allTemperature: allTemperature,
    dailyTemperatureRange: Shared.convertTemperature(Shared.unitBuilder(tempRange, "C", "Celsius"), tempUnitName),
    icon: Shared.getIcon(conditionInfo.imageIconNumber)
  }
  results.push(weather)
  
  return results
}

exports.getHistoricalWeather = getHistoricalWeather
exports.getHistoricalHourlyWeather = getHistoricalHourlyWeather
