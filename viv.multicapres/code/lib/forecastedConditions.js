var Shared = require('lib/shared.js')
var Log = require('lib/log.js')
var Astronomy = require('lib/astronomy.js')

// parse the response to get the forecasted weather [for specific date(s)]
function getForecastedWeather(point, tempUnitName, reqStartDate, reqEndDate, root, curLocale) {
  Log.debug('getForecastedWeather', point, tempUnitName, String(reqStartDate), String(reqEndDate), root)
  var results = []
  if (!root) {
    return results
  }
  var localTimeZone = reqStartDate.getTimeZoneId()

  var startDateCompare = reqStartDate.atStartOfDay()
  var endDateCompare = (reqEndDate ? reqEndDate.atEndOfDay() : null)

  if (!root.day0) {
    return results
  }

  var forcastYear
  var currentYear = forcastYear = root.date.substr(0,4)
  var currentMonth = root.date.substr(4,2)
  var changedYear = false
  
  var skipping = false
  var forecastDays = [].concat(root.day0)
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
  for (var i = 0; i < forecastDays.length; i++) {
    var forecast = forecastDays[i]
    
    // There is no 'year' information in dayN array. So calculate it using current date.
    // If the number of 'month' is small than current number of month, it will be next year.
    if (!changedYear && forecast.mon < currentMonth) {
      forcastYear = Number(currentYear) + 1
      changedYear = true;
    }
    
    var when = {
      year: forcastYear,
      month: forecast.mon,
      day: forecast.day
    }

    var dateCompare = dates.ZonedDateTime.fromDate(when)
    dateCompare = dateCompare.withZoneSameLocal(localTimeZone)
    Log.debug('getForecastedWeather', i, 'dateCompare', dateCompare)
    if (!endDateCompare) {
      var checkDate = dateCompare.atStartOfDay().withZoneSameLocal(localTimeZone);
      // if we have only a start date, skip those that don't match the day
      if (!checkDate.isEqualTo(startDateCompare)) {
        if (!skipping) {
          skipping = true
          Log.debug('getForecastedWeather skipping', i,
                        'no end date and does not match start date', checkDate, startDateCompare)
        }
        continue
      }
    } else if (dateCompare.isBefore(startDateCompare) || dateCompare.isAfter(endDateCompare)) {
      // If we have an end date, skip anything outside the range.
      // This is unexpected if it's the first item.
      if (i === 0) {
        console.warn('getForecastedWeather skipping', i, 'outside range',
                     dateCompare, startDateCompare, endDateCompare)
      } else {
        if (!skipping) {
          skipping = true
          Log.debug('getForecastedWeather skipping', i, 'outside range',
                        dateCompare, startDateCompare, endDateCompare)
        }
      }
      continue
    } else if (skipping) {
      skipping = false
    }

    var tempHigh = Shared.checkValid(parseInt(forecast.maxt))
    var tempLow = Shared.checkValid(parseInt(forecast.mint))
    
    var lowTemperature = Shared.convertTemperature(Shared.unitBuilder(tempLow, "C", "Celsius"), tempUnitName)
    var highTemperature = Shared.convertTemperature(Shared.unitBuilder(tempHigh, "C", "Celsius"), tempUnitName)
    var tempRange = Shared.unitBuilder(highTemperature.value - lowTemperature.value, lowTemperature.unit.abbreviation, lowTemperature.unit.name)
    var temperatureComment = Shared.getTemperatureComment(undefined, highTemperature.value, lowTemperature.value, tempUnitName)
    var allTemperature = {
      high: highTemperature,
      low: lowTemperature,
      comment: temperatureComment,
      tense: 'Future'
    }

    if(forecast.wx_day === undefined )
      forecast.wx_day = forecast.wx
    var precipitationType = ''
    if (parseFloat(forecast.mint) < 0.0) {
      precipitationType = "Snow"
    } else {
      precipitationType = "Rain"
    }
    var probabilityOfPrecipitation = forecast.pop
    var conditionInfo = Shared.getConditionInfo(forecast.wx_day, curLocale)
    
    // Get data for air condition
    var CAI, dust, fineDust, ultraFineDust
    if (forecast.pm10 && forecast.pm10Level) {
      fineDust = {
        value: isNaN(forecast.pm10) ? undefined : forecast.pm10,
        level: isNaN(forecast.pm10Level) ? undefined : forecast.pm10Level
      }
    }
    if (forecast.pm25 && forecast.pm25Level) {
      ultraFineDust = {
        value: isNaN(forecast.pm25) ? undefined : forecast.pm25,
        level: isNaN(forecast.pm25Level) ? undefined : forecast.pm25Level
      }
    }
    if (fineDust && ultraFineDust) {
      dust = {
        fineDust: fineDust,
        ultraFineDust: ultraFineDust
      }
    }
    if (forecast.aqi) {
      var value = forecast.aqi
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
      CAI = {
        value: value,
        level: level
      }
    }

    // sunrise & sunset time
    var solarTimes = Astronomy.parseSolarTimes(forecast.sunrise, forecast.sunset, point, dateCompare.getDateTime())
    var sunrise = {
      time: solarTimes.sunrise.time
    }
    var sunset = {
      time: solarTimes.sunset.time
    }
    
    // moonrise & moonset time
    var lunarTimes = Astronomy.parseLunarTimes(forecast.moonrise, forecast.moonset, point, dateCompare.getDateTime())
    var moonrise = {
      time: lunarTimes.moonrise.time
    }
    var moonset = {
      time: lunarTimes.moonset.time
    }
    
    var weather = {
      $id: 100+i,
      location: point,
      when: when,
      type: "Forecast",
      condition: conditionInfo.condition,
      description: conditionInfo.strCondition,
      lowTemperature: lowTemperature,
      highTemperature: highTemperature,
      allTemperature: allTemperature,
      dailyTemperatureRange: tempRange,
      precipitationType: precipitationType,
      probabilityOfPrecipitation: probabilityOfPrecipitation,
      fineDust: fineDust,
      ultraFineDust: ultraFineDust,
      dust: dust,
      CAI: CAI,
      sunrise: sunrise,
      sunset: sunset,
      moonrise: moonrise,
      moonset: moonset,
      icon: Shared.getIcon(conditionInfo.imageIconNumber)
    }

    results.push(weather)
  }

  if (results.length > 10) {
    results = results.slice(0, 10)
  }

  Shared.calculateDailyPositionXY(results, tempUnitName)
  return results
}

exports.getForecastedWeather = getForecastedWeather