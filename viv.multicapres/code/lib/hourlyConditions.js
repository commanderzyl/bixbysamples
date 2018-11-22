var Shared = require('lib/shared.js')
var Log = require('lib/log.js')

// parse the response to get the hourly weather
function getHourlyWeather(point, tempUnitName, dateOpts, root, solarTimes, curLocale, now) {
  Log.debug('getHourlyWeather', point, tempUnitName, dateOpts, root, solarTimes)
  var results = []

  if (!root.hour0) {
    return results
  }
  
  var reqStartDate = dateOpts.context.start
  var reqEndDate = dateOpts.context.end
  var tense = String(dateOpts.tense)
  var skipping = false
  // VIV-16828 getTimeZoneId() returns +09:00
  var timeZone = now.getTimeZoneId()
  
  var forecastHours = [].concat(root.hour0)
  if (root.hour1) {
    forecastHours.push(root.hour1)
  }
  if (root.hour2) {
    forecastHours.push(root.hour2)
  }
  if (root.hour3) {
    forecastHours.push(root.hour3)
  }
  if (root.hour4) {
    forecastHours.push(root.hour4)
  }
  if (root.hour5) {
    forecastHours.push(root.hour5)
  }
  if (root.hour6) {
    forecastHours.push(root.hour6)
  }
  if (root.hour7) {
    forecastHours.push(root.hour7)
  }
  if (root.hour8) {
    forecastHours.push(root.hour8)
  }
  if (root.hour9) {
    forecastHours.push(root.hour9)
  }
  if (root.hour10) {
    forecastHours.push(root.hour10)
  }
  if (root.hour11) {
    forecastHours.push(root.hour11)
  }
  if (root.hour12) {
    forecastHours.push(root.hour12)
  }
  
  for (var i = 0; i < forecastHours.length; i++) {
    var forecast = forecastHours[i]
    var when = {
      date: {
        year: forecast.date.substr(0, 4),
        month: forecast.date.substr(4, 2),
        day: forecast.date.substr(6, 2)
      },
      time: {
        hour: forecast.hour,
        minute: 0,
        second: 0,
        timezone: timeZone
      }
    }

    if (reqStartDate && reqEndDate) {
      var curTime = dates.ZonedDateTime.fromDateTime(when)
      if (reqStartDate.isEqualTo(reqEndDate) && !reqStartDate.isEqualTo(curTime)) {
        // if start and end dates are the same, assume a "right now" query
        // ignore hourly weather reports that are more than 30 minutes off the requested time
        var durationUntil = reqStartDate.durationUntil(curTime)
        if (durationUntil.periodDays || durationUntil.periodHours || (durationUntil.periodMinutes > 30)) {
          if (!skipping) {
            Log.debug('getHourlyWeather', i, 'skipping (>30)', results, durationUntil)
          }
          skipping = true
          continue
        } else if ((durationUntil.periodDays || durationUntil.periodHours || (durationUntil.periodMinutes == 30)) && curTime.isBefore(reqStartDate)) {
          // if it's exactly 30 minutes off, pick the later time
          if (!skipping) {
            Log.debug('getHourlyWeather', i, 'skipping (=30)', results, durationUntil)
          }
          skipping = true
          continue
        }
      } else if (curTime.isBefore(reqStartDate) || curTime.isAfter(reqEndDate)) {
        if (!skipping) {
          Log.debug('getHourlyWeather', i, 'skipping (outside range)', results, 'start', String(reqStartDate), 'end', String(reqEndDate), 'this', String(curTime))
        }
        skipping = true
        continue
      }
    }
    skipping = false

    var precipitationAmount = forecast.prec
    var precipitationType = ''
    if (parseFloat(forecast.temp) < 0.0) {
      precipitationType = "Snow"
    } else {
      precipitationType = "Rain"
    }

    var precipitation
    if (precipitationType) {
      if (precipitationType == 'Snow') {
        precipitation = Shared.unitBuilder(precipitationAmount, "cm", "Centimeter")
      } else {
        precipitation = Shared.unitBuilder(precipitationAmount, "mm", "Millimeter")
      }
    }

    var probabilityOfPrecipitation = Shared.checkValid(forecast.pop);
    if (probabilityOfPrecipitation && !precipitationType) {
      if (parseFloat(forecast.temp) < 0) {
        precipitationType = "Snow"
      } else {
        precipitationType = "Rain"
      }
    }

    var snowfall, rainfall
    if (precipitation) {
      if (precipitationType == "Rain") {
        rainfall = precipitation
      } else {
        snowfall = precipitation
      }
    }

    var temperature = Shared.convertTemperature(Shared.unitBuilder(forecast.temp, 'C', 'Celsius'), tempUnitName)

    // TOBE: modify weatehr code
    var conditionInfo = Shared.getConditionInfo(forecast.wx, curLocale)

    var weather = {
      $id: 100+i,
      location: point,
      when: when,
      type: "Hourly",
      condition: conditionInfo.condition,
      description : conditionInfo.strCondition,
      temperature: temperature,
      probabilityOfPrecipitation: probabilityOfPrecipitation,
      precipitation: Shared.checkValid(precipitation),
      precipitationType: precipitationType,
      rainfall: rainfall,
      snowfall: snowfall,
      relativeHumidity: Shared.checkValid(forecast.humi),
      wind: Shared.wind(forecast.wdir_360, forecast.wspd),
      icon: Shared.getIcon(conditionInfo.imageIconNumber, when, solarTimes)
    }

    results.push(weather)
  }
  
  var finalResult
  if (results.length == 8 && dateOpts.tense == 'Future') {
    finalResult = results.slice(2, 8)
  } else {
    finalResult = results.slice(0, 6)
  }
  
  Shared.calculateHourlyPositionXY(finalResult, tempUnitName)
  return finalResult
}

exports.getHourlyWeather = getHourlyWeather;