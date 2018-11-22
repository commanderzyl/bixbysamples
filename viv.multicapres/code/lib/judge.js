// ************************************************************
// weather.JudgeWeatherCondition.js: Determine if the weather condition is true
//   for the given weather.
//
// Implemented Functions: weather.JudgeWeatherCondition(condition, weather)
// Author: Andrew Roberts
// ************************************************************

// ------------------------------------------------------------
// Implements weather.JudgeWeatherCondition function
//   Inputs:  condition [weather.WeatherCondition], weather [weather.Weather]
//   Outputs: weather.SolarNoon
// ------------------------------------------------------------
var Log = require('lib/log.js')
var conditionMatch = {
  Rain: ["Rain", "Mostlycloudywithshowers", "Becomingcloudywithrain", "Rainythenclearing", "Rainorsnow", "Becomingcloudywithrainorsnow", "Snoworrainthenclearing", "Thunderstorms", "Thundershower", "Shower", "Thundershowerwithhail", "Sleet", "Lightrain", "Moderaterain", "Heavyrain", "Storm", "Heavystorm", "Severestorm", "Icerain", "Lighttomoderaterain", "Moderatetoheavyrain", "Heavyraintostorm", "Stormtoheavystorm", "Heavytoseverestorm", "rain"],
  Snow: ['Snow', 'Becomingcloudywithsnow', 'Rainorsnow', 'Becomingcloudywithrainorsnow', "Snowflurry", "Lightsnow", "Moderatesnow", "Heavysnow", "Snowstorm", "Lighttomoderatesnow", "Moderatetoheavysnow", "Heavysnowtosnowstorm"],
}

// Input weather should be a single instance of a weather.WeatherInformation subtype.
function testWeather(condition, atLeast, atMost, greaterThan, lessThan, weather) {
  Log.debug('testWeather', condition, atLeast, atMost, greaterThan, lessThan, weather)

  var wcondition = String(weather.condition)
  var result = false
  var test = conditionMatch[condition]
  if (test) {
    result = test.indexOf(wcondition) > -1
  }

  if ('Rain' === condition && weather.probabilityOfPrecipitation < 30) {
    result = false;
  }

  // Sometimes the API reports rainfall on a Cloudy day
  if (!result && 'Rain' === condition && weather.rainfall && weather.rainfall.value > 0.0) {
    result = true
  }
  Log.debug('testWeather', String(weather.type), weather, test, result)
  return result
}

function checkWeather(condition, atLeast, atMost, greaterThan, lessThan, weather, $vivContext) {
  // Each input weather is a weather.Weather with properties that subtype weather.WeatherInformation
  // Look forward in time until we find matches or run out of input.
  var curLocale = $vivContext.locale
  var tense = String(weather.locus.tense)
  var strCondition = String(condition)
  Log.debug('checkWeather', strCondition, weather, String(weather.locus.type), tense, String(weather.country))
  
  var timeZoneId = dates.ZonedDateTime.now(weather.locus.location).getTimeZoneId()
  var candidates = []
  var filtered
  var locusStart = dates.ZonedDateTime.fromDateTime(weather.locus.when.start)
  var locusEnd = dates.ZonedDateTime.fromDateTime(weather.locus.when.end).atEndOfDay()
  if (weather.locus.when.start.utcInstant == weather.locus.when.end.utcInstant) {
    // [P180509-00595]
    locusEnd = locusStart.plusDays(6).atEndOfDay()
    tense = 'Future'
  }
  Log.debug('checkWeather', tense, String(locusStart), String(locusEnd))
  var matchType
  var matchTypes = []
  var dateFilterFn = function (weather) {
    var zdt = dates.ZonedDateTime.fromDate(weather.when)
    Log.debug('checkWeather dateFilterFn', String(zdt))
    return zdt.isAfterOrEqualTo(locusStart) && zdt.isBeforeOrEqualTo(locusEnd)
  }
  var dateTimeFilterFn = function (weather) {
    var zdt = dates.ZonedDateTime.fromDateTime(weather.when)
    Log.debug('checkWeather dateTimeFilterFn', String(zdt))
    return zdt.isAfterOrEqualTo(locusStart) && zdt.isBeforeOrEqualTo(locusEnd.plusSeconds(1))
  }
  if (String(weather.locus.type) === 'Typical' && weather.typical) {
    candidates.push([weather.typical])
  } else if (tense === 'Present' && weather.now) {
    candidates.push([weather.now])
    matchTypes.push('Current')
    if (curLocale == 'zh-CN' && weather.daily[0]) {  //for CN, daily[0] represents today, should be counted into current
      var day0 = weather.daily[0]
      candidates.push([day0])
      matchTypes.push('Current')
    }
    if (weather.hourly && (strCondition == 'Rain' || strCondition == 'Windy' || strCondition == 'Humid' || strCondition == 'Dry' || strCondition == 'Dusty')) {
      // May want to provide dialog for later today etc.
      filtered = weather.hourly.filter(dateTimeFilterFn)
      if (filtered.length) {
        candidates.push(filtered)
        matchTypes.push('Hourly')
      }
    }
  } else {
    if (weather.daily && weather.hourly) {
      if (weather.daily.length >= 2) {
        filtered = weather.daily.filter(dateFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Forecast')
        }
        filtered = weather.hourly.filter(dateTimeFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Hourly')
        }
      } else {
        filtered = weather.hourly.filter(dateTimeFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Hourly')
        }
        filtered = weather.daily.filter(dateFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Forecast')
        }
      }
    } else {
      if (weather.hourly && weather.hourly.length) {
        filtered = weather.hourly.filter(dateTimeFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Hourly')
        }
      }
      if (weather.daily && weather.daily.length) {
        filtered = weather.daily.filter(dateFilterFn)
        if (filtered.length) {
          candidates.push(filtered)
          matchTypes.push('Forecast')
        }
      }
    }
  }
  Log.debug('checkWeather candidates', candidates.length, candidates, matchTypes)
  if (!candidates.length) {
    console.warn('checkWeather: no candidates!')
  }
  var judgement = false
  var locus, weatherMatches
  for (var i = 0; i < candidates.length; i++) {
    locus = candidates[i]
    Log.debug('checkWeather candidate', i, locus, String(locus.when), matchTypes[i])
    weatherMatches = locus.filter(function (weather, j) {
      return testWeather(strCondition, atLeast, atMost, greaterThan, lessThan, weather)
    }).map(function (weather, j) {
      // construct a weather.WeatherDateMatch with either a DateTime or Date.
      Log.debug('checkWeather', i, j, weather)
      var when = weather.when
      if (when.time) {
        when = {
          dateTime: weather.when
        }
      } else {
        when = {
          date: weather.when
        }
      }
      return when
    })
    Log.debug('checkWeather', i, locus, matchTypes[i], weatherMatches.length, weatherMatches)
    if (weatherMatches.length) {
      // There's a potential bug here when we have hourly and forecast in the same test group.
      matchType = matchTypes[i]
      judgement = true
      break
    }
  }

  // utility function
  var zdt = function (raw) {
    return (raw.dateTime ? dates.ZonedDateTime.fromDateTime(raw.dateTime) : dates.ZonedDateTime.fromDate(raw.date).atStartOfDay())
  }

  // For some reason the input dates can get out of order. Fix that.
  Log.debug('checkWeather matched', weatherMatches)
  if (weatherMatches) {
    weatherMatches.sort(function (aRaw, bRaw) {
      var a = zdt(aRaw)
      var b = zdt(bRaw)
      if (a.isBefore(b)) {
        return -1
      }
      if (b.isBefore(a)) {
        return 1
      }
      return 0
    })
    Log.debug('checkWeather sorted', weatherMatches)
  }

  if (judgement && weather.hourly && weather.hourly.length) {
    Log.debug('checkWeather hourly', 'first', weatherMatches[0], 'hourlyLast', weather.hourly[weather.hourly.length - 1].when)
    var weatherMatchesFirst = zdt(weatherMatches[0])
    var hourlyLast = dates.ZonedDateTime.fromDateTime(weather.hourly[weather.hourly.length - 1].when)
    if (weatherMatchesFirst.isAfter(hourlyLast)) {
      // prevent display of hourly and current conditions
      Log.debug('checkWeather removing hourly and now')
      delete weather.hourly
      delete weather.now
    }
  }
  
  Log.debug("checkWeather", judgement)
  return {
    // repeated inputs
    condition: condition,
    greaterThan: greaterThan,
    judgement: judgement,
    lessThan: lessThan,
    weather: weather,
    // new information
    matchType: matchType,
    tense: tense,
    weatherMatches: weatherMatches
  }
}

exports.checkWeather = checkWeather
