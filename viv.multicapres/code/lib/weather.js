// ************************************************************
// weather.js
//   Encapsulates Weather Underground's API
//
// Implemented Functions: findWeather()
//
// Doc: https://docs.google.com/a/sixfivelabs.com/document/d/1KB6rsO0eoW1rdul9PoUhq4aI768PcQdDiVUptVUj2Wc/edit
// Author: Adam Cheyer
// ************************************************************

var Astronomy = require('lib/astronomy.js')
var Current = require('lib/currentConditions.js')
var Forecast = require('lib/forecastedConditions.js')
var Historical = require('lib/historicalConditions.js')
var Hourly = require('lib/hourlyConditions.js')
var Shared = require('lib/shared.js')
var Dialog = require('lib/dialog.js')
var Log = require('lib/log.js')
var changeAPIRspsonseToCN =require('lib/changeAPIRspsonseToCN.js')

var API_BASE_KR = "https://galaxy.wni.com/api_v2/"
var TEST_API_BASE_KR = "https://galaxy.wni.com/api_v2_test/"
var API_BASE_CN = "https://api.cn-weathernews.cn/api/"

// Earliest and latest possible minute deltas that are still considered "now"
var NOW_LIMIT = 15

var curLocale = 'ko-KR'
var handsFree
var textDateInfo

function dateOptions(point, now, date, dateTime, dateInterval, dateTimeInterval, duration, _tense, type) {
  Log.debug('dateOptions', point, date, dateTime, dateInterval, dateTimeInterval, duration, _tense, type)
  var today = now.atStartOfDay()
  var yesterday = today.minusDays(1)
  var limitDay
  var start = today
  var end
  var tense = _tense
  var locus = {}
  // VIV-16828 getTimeZoneId() returns +09:00
  var localTimeZone = now.getTimeZoneId()
  
  Log.debug("dateOptions", 'localTimeZone', localTimeZone)
  if (localTimeZone == 'Asia/Seoul' || localTimeZone == '+09:00' || localTimeZone == 'Etc/GMT-9') {
    limitDay = today.plusDays(10).atEndOfDay()
  } else {
    limitDay = today.plusDays(6).atEndOfDay()
  }
  
  // Earliest and latest possible value that are still considered "now"
  var nowLimitPre = now.minusMinutes(NOW_LIMIT)
  var nowLimitPost = now.plusMinutes(NOW_LIMIT)

  if (date || dateTime || dateInterval || dateTimeInterval || duration) {
    // we have temporal inputs - generate start and end datetimes
    var dateType
    if (date) {
      // weather for a specific day
      dateType = 'date'
      var localDate
      switch(String(date.namedDate)) {
        case 'Yesterday':
          localDate = now.minusDays(1)
          start = localDate.atStartOfDay()
          break;
        case 'Today':
          break;
        case 'Tomorrow':
          localDate = now.plusDays(1)
          start = localDate.atStartOfDay()
          break;
        case 'DayAfterTomorrow':
          localDate = now.plusDays(2)
          start = localDate.atStartOfDay()
          break;
        case 'DayAfterDayAfterTomorrow':
          localDate = now.plusDays(3)
          start = localDate.atStartOfDay()
          break;
        case 'DayAfterDayAfterDayAfterTomorrow':
          localDate = now.plusDays(4)
          start = localDate.atStartOfDay()
          break;
        default:
          start = dates.ZonedDateTime.fromDate(date).atStartOfDay().withZoneSameLocal(localTimeZone)
      }
      
      if (start.isBefore(yesterday) || start.isAfter(limitDay)) {
        Log.debug("dateOptions", start, yesterday, limitDay)
        // Duration limit error
        return
      } else if (start.isEqualTo(yesterday)) {
        tense = 'Past'
      } else if (start.isEqualTo(today)) {
        tense = 'Present'
      } else {
        tense = 'Future'
      }
      if (duration) {
        if (duration.periodWeeks) {
          end = start.plusDays((duration.periodWeeks * 7) - 1).atEndOfDay()
        } else if (duration.periodDays) {
          end = start.plusDays(duration.periodDays - 1).atEndOfDay()
        } else if (duration.periodMonths) {
          end = start.plusDays((duration.periodMonths * 30) - 1)
        }
      } else {
        end = start.atEndOfDay()
      }
    } else if (dateTime) {
      dateType = 'dateTime'
      start = dates.ZonedDateTime.fromDateTime(dateTime).withZoneSameLocal(localTimeZone)
      if (start.atStartOfDay().isBefore(yesterday) || (start.atStartOfDay().isEqualTo(today) && start.isBefore(now.minusSeconds(5))) || start.isAfter(limitDay) ) {
        // Duration limit error
        return
      }
      if (start.atStartOfDay().isEqualTo(today)) {
        tense = 'Present'
      } else if (start.atStartOfDay().isEqualTo(yesterday)) {
        tense = 'Past'
      }
      if (dateTime.time.namedTime && dateTime.time.namedTime == 'Now') {
        end = start.atEndOfDay()
      }
    } else if (dateInterval) {
      // TODO "typical weather for fubar in monthname" usually ends up here, but so do some forecasts.
      dateType = 'dateInterval'
      if (dateInterval.start && dateInterval.start.day == 1 && dateInterval.end && dateInterval.end.day >= 28) {
        // Monthly weather exception
        return
      }
      if (dateInterval.relNamedDateInterval && dateInterval.relNamedDateInterval == 'Week' && dateInterval.offset && dateInterval.offset == 'This') {
        start = now
        end = start.plusDays(6).atEndOfDay()
        tense = 'Future'
      } else {
        if (dateInterval.start) {
          start = dates.ZonedDateTime.fromDate(dateInterval.start).atStartOfDay().withZoneSameLocal(localTimeZone)
        } else {
          start = now
        }
        if (dateInterval.end) {
          end = dates.ZonedDateTime.fromDate(dateInterval.end).atEndOfDay().withZoneSameLocal(localTimeZone)
        }
      }
      if ((start.isBefore(yesterday) && end && end.isBefore(today)) || start.isAfter(limitDay)) {
        // Duration limit error
        return
      }
    } else if (dateTimeInterval) {
      dateType = 'dateTimeInterval'
      if (dateTimeInterval.start) {
        start = dates.ZonedDateTime.fromDateTime(dateTimeInterval.start).withZoneSameLocal(localTimeZone)
        if (start.atStartOfDay().isBefore(yesterday) || start.isAfter(limitDay)) {
          // Duration limit error
          return
        } else if (start.atStartOfDay().isEqualTo(today) && start.isBefore(now)) {
          start = now
        }
      } else {
        start = now
      }
      if (dateTimeInterval.end) {
        end = dates.ZonedDateTime.fromDateTime(dateTimeInterval.end).withZoneSameLocal(localTimeZone)
        if (end.atStartOfDay().isBefore(yesterday)) {
          // Duration limit error
          return
        }
      } else if (['time.StartingAfterDateTime', 'time.StartDateTime']
        .indexOf(dateTimeInterval.start.$type) > -1) {
        // TODO this may not always be a good choice - can time.ResolveAmbiguousDateTime help?
        // cf https://sixfivelabs.myjetbrains.com/youtrack/issue/VIV-5937
        end = start.atEndOfDay().withZoneSameLocal(localTimeZone)
      }
      Log.debug('dateOptions', start, end)
    } else {
      start = now
      if (duration.periodWeeks) {
        end = today.plusDays((duration.periodWeeks * 7) - 1).atEndOfDay()
      } else if (duration.periodDays) {
        end = today.plusDays(duration.periodDays - 1).atEndOfDay()
      } else if (duration.periodMonths) {
        end = today.plusDays((duration.periodMonths * 30) - 1)
      }
      tense = 'Future'
    }

    // Fix up tense
    Log.debug('dateOptions tense', tense, 'start', String(start), 'end', String(end), 'today', String(today))
    if (start.isBefore(nowLimitPre)) {
      if (!end || end.isBefore(nowLimitPre)) {
        tense = 'Past'
      } else {
        if (end.atStartOfDay().isEqualTo(today)) {
          tense = 'Present'
        } else {
          tense = 'Future'
        }
      }
    } else if (start.isAfter(nowLimitPost)) {
      tense = 'Future'
    }

    // preserve temporal inputs as locus
    locus = {
      start: start,
      end: end || start,
      type: dateType
    }

    // relax dateTime for context, while keeping locus
    if (dateType === 'dateTime' && !end) {
      start = start.minusHours(1)
      end = start.plusHours(6)
    }
  } else {
    // No temporal inputs
    switch (type) {
      case 'Forecast':
        end = start.plusDays(6)
        if (!tense) {
          tense = 'Future'
        }
        break
      case "Historical":
        // assume yesterday
        start = now.minusDays(1)
        tense = 'Past'
        break
      case 'Hourly':
        start = now
        end = start.plusDays(1)
        tense = 'Present'
        break
      default:
        switch (_tense) {
          case 'Past':
            // yesterday
            start = today.minusDays(1)
            end = start.atEndOfDay()
            tense = 'Past'
            break
          default:
            // Don't use start of today because that'll include historical data too.
            start = now
            end = start.plusDays(6)
              // Hint that the locus should be current conditions.
            tense = 'Present'
        }
    }
  }

  // Fix tense
  if (!tense) {
    tense = ['Future', 'Past'].indexOf(_tense) > -1 ? _tense : 'Present'
  }
  
  return {
    context: {
      start: start,
      end: end || start,
    },
    locus: locus,
    tense: tense
  }
}

function whenZdt(when) {
  if (when.time) {
    return new dates.ZonedDateTime.fromDateTime(when)
  }
  return new dates.ZonedDateTime.fromDate(when)
}

// Weather-aware array push or unshift, as needed.
// Makes assumptions about how the data will arrive.
function pushDaily(_dataPrev, _dataNext) {
  Log.debug('pushDaily', 'prev', _dataPrev ? _dataPrev.length : 0, _dataPrev, 'next', _dataNext ? _dataNext.length : 0, _dataNext)
  if (!_dataNext || !_dataNext.length) {
    if (_dataNext && !Array.isArray(_dataNext)) {
      console.warn("FindWeather.pushDaily: _dataNext is not an array", typeof _dataNext, _dataNext)
    }
    return _dataPrev || []
  }
  if (!_dataPrev || !_dataPrev.length) {
    return _dataNext || []
  }

  // Zipper merge: assume both arrays are already sorted by date.
  var dataPrev = [].concat(_dataPrev)
  var dataNext = [].concat(_dataNext)
  var prev, prevWhen
  var next, nextWhen
  var merged = []
  var ignorableTypes = ['Historical', 'Typical']
  var prevShift = function () {
    prev = dataPrev.shift()
    prevWhen = prev ? whenZdt(prev.when).atStartOfDay() : null
  }
  var nextShift = function () {
    next = dataNext.shift()
    nextWhen = next ? whenZdt(next.when).atStartOfDay() : null
  }
  // We know each array has at least one item
  prevShift()
  nextShift()
  while (1) {
    // Log.debug('pushDaily', dataPrev)
    // halting conditions
    if (!prev && !next) {
      break
    }
    if (!prev) {
      merged = merged.concat(next, dataNext)
      break
    }
    if (!next) {
      merged = merged.concat(prev, dataPrev)
      break
    }
    // merge
    if (prevWhen.isBefore(nextWhen)) {
      merged.push(prev)
      prevShift()
    } else if (nextWhen.isBefore(prevWhen)) {
      merged.push(next)
      nextShift()
    } else {
      // equal timestamps: can we ignore either?
      console.warn('pushDaily unexpected', 'prev', prev.type, prevWhen, 'next', next.type, nextWhen)
      if (ignorableTypes.indexOf(next.type) > -1) {
        Log.debug('pushDaily skipping next', next.type, 'keeping', prev)
        merged.push(prev)
        prevShift()
        nextShift()
      } else if (ignorableTypes.indexOf(prev.type) > -1) {
        Log.debug('pushDaily skipping prev', prev.type, 'keeping', next)
        prevShift()
        merged.push(next)
        nextShift()
      } else {
        fail.informationError("unable to merge weather data")
      }
    }
  }

  Log.debug('pushDaily merged', merged.length, merged)
  return merged
}

// construct an interval from whatever we have
function locusWhen(first, last) {
  Log.debug('locusWhen', first, last)
  var when = {}
  if (first.start || first.end) {
    Log.debug('locusWhen first is an interval')
    when.start = first.start
  } else if (first.dateTime) {
    Log.debug('locusWhen first is a dateTime')
    when.start = first
  } else if (first.getDateTime) {
    Log.debug('locusWhen first is a zdt', first)
    when.start = first.getDateTime()
  } else {
    Log.debug('locusWhen first is a date')
    when.start = first
  }

  if (last.start || last.end) {
    Log.debug('locusWhen last is an interval')
    when.end = last.end
  } else if (last.dateTime) {
    Log.debug('locusWhen last is a dateTime')
    when.end = last
  } else if (last.getDateTime) {
    Log.debug('locusWhen last is a zdt', last)
    when.end = last.getDateTime()
  } else {
    Log.debug('locusWhen last is a date')
    when.end = last
  }

  Log.debug('locusWhen', when)
  return when
}

// Input locus is an array of objects.
// Enrich and transform to a single object.
function locusEnrich(weather, dateOpts, _locus, root) {
  Log.debug('locusEnrich', 'weather', weather, 'dateOpts', dateOpts, '_locus', _locus.length, _locus[0].type, _locus)

  // common properties
  var locus
  if (dateOpts.locus.start && dateOpts.locus.end) {
    Log.debug('locusEnrich', 'selecting from', dateOpts.locus.start, 'to', dateOpts.locus.end)
    for (var i=0; i<_locus.length; i++) {
      // Start with the first reading that's fully inside the locus.
      var zdt = _locus[i].type === 'Hourly' ? dates.ZonedDateTime.fromDateTime(_locus[i].when) : dates.ZonedDateTime.fromDate(_locus[i].when)
      if (zdt.isAfterOrEqualTo(dateOpts.locus.start)) {
        locus = Shared.objectAssign({}, _locus[i])
        Log.debug('locusEnrich', 'found', i, _locus[i].type, _locus[i])
        break
      }
    }
  }
  if (!locus) {
    locus = Shared.objectAssign({}, _locus[0])
  }
  locus.tense = dateOpts.tense

  // start and end
  // Use dateOpts.locus when we have it, otherwise actual locus.
  locus.when = locusWhen(dateOpts.locus.start || _locus[0].when,
    dateOpts.locus.end || _locus.slice(-1)[0].when)
  Log.debug('locusEnrich', 'locus', locus.type, locus)

  // Some values may need to come from context if locus is now-ish
  var context = {}
  if (locus.type === 'Current') {
    if (weather.hourly.length === 1) {
      context = weather.hourly[0]
    } else if (weather.now) {
      context = weather.now
    }
  }
  if (!context) {
    throw fail.informationError("missing context for locus")
  }
  Log.debug('locusEnrich', 'context', context)

  // Enrich high & low temperature
  var scope = getScope(weather, locus.type)
  // The reason that check handsFree mode
  // We need to get max,min temperatures in case of hands free when there is no any `date` or `time` information
  if (weather.daily && weather.daily.length > 0 && (locus.tense != 'Present' || (weather.daily.length == 6 && handsFree) || textDateInfo == 'ThisWeek')) {
    locus.minHighTemperature = locus.highTemperature = weather.daily[0].highTemperature
    locus.maxLowTemperature = locus.lowTemperature = weather.daily[0].lowTemperature
    locus.highTempDay = locus.lowTempDay = weather.daily[0].when
    for (var i=1; i<weather.daily.length; i++) {
      if (weather.daily[i].highTemperature.value > locus.highTemperature.value) {
        locus.highTemperature = weather.daily[i].highTemperature
        locus.highTempDay = weather.daily[i].when
      }
      if (weather.daily[i].highTemperature.value < locus.minHighTemperature.value) {
        locus.minHighTemperature = weather.daily[i].highTemperature
      }
      if (weather.daily[i].lowTemperature.value < locus.lowTemperature.value) {
        locus.lowTemperature = weather.daily[i].lowTemperature
        locus.lowTempDay = weather.daily[i].when
      }
      if (weather.daily[i].lowTemperature.value > locus.maxLowTemperature.value) {
        locus.maxLowTemperature = weather.daily[i].lowTemperature
      }
    }
    if (weather.now) {
      if (weather.now[0].highTemperature.value > locus.highTemperature.value) {
        locus.highTemperature = weather.now[0].highTemperature
        locus.highTempDay = weather.now[0].when.date
      }
      if (weather.now[0].highTemperature.value < locus.minHighTemperature.value) {
        locus.minHighTemperature = weather.now[0].highTemperature
      }
      if (weather.now[0].lowTemperature.value < locus.lowTemperature.value) {
        locus.lowTemperature = weather.now[0].lowTemperature
        locus.lowTempDay = weather.now[0].when.date
      }
      if (weather.now[0].lowTemperature.value > locus.maxLowTemperature.value) {
        locus.maxLowTemperature = weather.now[0].lowTemperature
      }
    }
  } else {  // if scope is hourly
    if (weather.now) {
      locus.highTemperature = weather.now[0].highTemperature
      locus.lowTemperature = weather.now[0].lowTemperature
    } else if (weather.daily) {
      locus.highTemperature = weather.daily[0].highTemperature
      locus.lowTemperature = weather.daily[0].lowTemperature
    }
  }
  
  // Enrich temperature range
  if (!locus.dailyTemperatureRange && weather.daily && weather.daily.length && locus.type == 'Forecast') {
    locus.dailyTemperatureRange = weather.daily[0].dailyTemperatureRange
  }
  
  // Add AllTemperature if scope is hourly
  var temperatureComment
  if (!locus.allTemperature) {
    if (scope == 'hourly') {
      temperatureComment = Shared.getTemperatureComment(undefined, locus.highTemperature.value, locus.lowTemperature.value, locus.highTemperature.unit.name)
      locus.allTemperature = {
        high: locus.highTemperature,
        low: locus.lowTemperature,
        comment: temperatureComment,
        tense: 'Future'
      }
    }
  } else {
    if (weather.now) {
      locus.allTemperature = weather.now[0].allTemperature
    }
  }

  // Enrich wind when query tomorrow
  if (!locus.wind && weather.hourly && textDateInfo == 'Tomorrow') {
    for (var i=0; i<weather.hourly.length; i++) {
      if (weather.hourly[i].when.time.hour == '12' || weather.hourly[i].when.time.hour == '11') {
        if (weather.hourly[i].wind) {
          locus.wind = weather.hourly[i].wind
        }
        break
      }
    }
  }
  
  // Enrich precipitation when query tomorrow
  var totalPrecipitation = 0.0
  if (!locus.rainfall && weather.hourly && locus.precipitationType == 'Rain' && textDateInfo == 'Tomorrow') {
    for (var i=0; i<weather.hourly.length; i++) {
      if (weather.hourly[i].rainfall) {
        totalPrecipitation += Number(weather.hourly[i].rainfall.value)
      }
    }
    locus.rainfall = Shared.unitBuilder(totalPrecipitation, "mm", "Millimeter")
  } else if (!locus.snowfall && weather.hourly && locus.precipitationType == 'Snow' && textDateInfo == 'Tomorrow') {
    for (var i=0; i<weather.hourly.length; i++) {
      if (weather.hourly[i].snowfall) {
        totalPrecipitation += Number(weather.hourly[i].snowfall.value)
      }
    }
    locus.snowfall = Shared.unitBuilder(totalPrecipitation, "cm", "Centimeter")
  }
  
  // [P180504-05122] Enrich humidity when query tomorrow
  if (!locus.relativeHumidity && weather.hourly && textDateInfo == 'Tomorrow') {
    for (var i=0; i<weather.hourly.length; i++) {
      if (weather.hourly[i].when.time.hour == '12' || weather.hourly[i].when.time.hour == '11') {
        if (weather.hourly[i].relativeHumidity) {
          locus.relativeHumidity = weather.hourly[i].relativeHumidity
        }
        break
      }
    }
  }
  
  // Enrich dusty info when query dateTimeInterval (tomorrow morning, tomorrow evening ..)
  if (!locus.fineDust && !locus.ultraFineDust && !locus.CAI && weather.daily && weather.daily.length > 0 && locus.when.start.date.day == weather.daily[0].when.day) {
    locus.fineDust = weather.daily[0].fineDust
    locus.ultraFineDust = weather.daily[0].ultraFineDust
    locus.CAI = weather.daily[0].CAI
  }
  
  // Enrich sun info when query dateTimeInterval (tomorrow morning, tomorrow evening ..)
  if (!locus.sunrise && !locus.sunset && weather.daily && weather.daily.length > 0) {
    locus.sunrise = weather.daily[0].sunrise
    locus.sunset = weather.daily[0].sunset
  }
  
  // If the type of when is 'dateTime', build delta temperature with now.
  if (dateOpts.locus.type == 'dateTime' && weather.hourly && weather.now) {
    locus.deltaCurrentTemp = Shared.convertTemperature(Shared.unitBuilder(weather.hourly[0].temperature.value - weather.now[0].temperature.value, "C", "Celsius"))
    if (locus.deltaCurrentTemp.value < 0) {
      locus.deltaCurrentTemp.moreLess = 'Less'
    } else if (locus.deltaCurrentTemp.value > 0) {
      locus.deltaCurrentTemp.moreLess = 'More'
    } else {
      locus.deltaCurrentTemp.moreLess = 'Same'
    }
    locus.deltaCurrentTemp.value = Math.abs(locus.deltaCurrentTemp.value)
  }
  
  // Add additional weather info
  locus.link = root.urls.forecast
  if(curLocale == 'ko-KR'){
    if (root.country_en == 'South Korea') {
      locus.onlyKR = true
      locus.displayLocation = root.state_ko + " " + root.city_ko
    } else {
      if (root.country_ko == root.city_ko) {
        locus.displayLocation = root.city_ko
      } else {
        locus.displayLocation = root.country_ko + " " + root.city_ko
      }
    }
  } else {
    if(root.state_cn == root.city_cn) {
      locus.displayLocation = root.city_cn
    } else {
      locus.displayLocation = root.state_cn + root.city_cn
    }
  }
  
  Log.debug('locusEnrich', 'final', locus)
  return locus
}

// Build the data structure that will be used for all training and most dialog, but not for layouts.
// Exception: some layouts use locus.location, for convenience.
function getLocus(dateOpts, weather, root) {
  Log.debug('getLocus', dateOpts, weather)

  // don't use object assign here: enrichment will do it.
  var locus
  switch (dateOpts.locus.type) {
    case 'date':
    case 'dateInterval':
      if (weather.now && weather.now.length) {
        Log.debug('getLocus', dateOpts.tense, 'now', weather.now)
        locus = weather.now
      } else {
        Log.debug('getLocus', dateOpts.tense, 'daily')
        locus = weather.daily
      }
      break;
    default:
      if (dateOpts.tense === 'Future') {
        if (dateOpts.locus.type == 'dateTime' && weather.hourly && weather.hourly.length) {
          locus = weather.hourly
        } else if (weather.now) {
          locus = weather.now
        } else if (weather.hourly && weather.hourly.length && weather.hourly.length < 5) {
          if (weather.daily && weather.daily.length <= 1) {
            locus = weather.hourly
          } else {
            locus = weather.daily
          }
        } else if (weather.daily && weather.daily.length) {
          locus = weather.daily
        }
      } else if (weather.now && (dateOpts.tense === 'Present' || weather.daily.length == 1)) {
        // what's the temperature now?
        Log.debug('getLocus', dateOpts.tense, 'now', weather.now)
        locus = weather.now
        if (weather.hourly && weather.hourly.length) {
          locus.probabilityOfPrecipitation = weather.hourly[0].probabilityOfPrecipitation
        }
      } else if (weather.daily && weather.daily.length &&
                 (weather.daily.length >= 1 ||
                  !(weather.hourly && weather.hourly.length))) {
        Log.debug('getLocus', dateOpts.tense, 'daily')
        locus = weather.daily
      } else if (weather.hourly && weather.hourly.length) {
        // TODO filter if we known what hour(s) we want?
        Log.debug('getLocus', dateOpts.tense, 'hourly')
        locus = weather.hourly
      } else if (weather.now && weather.now.length) {
        // This should only happen when replaying from web cache for unit tests.
        // We asked for an N-day forecast but all the results were outside the range,
        // or something like that.
        console.warn('getLocus', dateOpts.tense, 'now (fallback)')
        locus = weather.now
      }
  }

  if (!locus || !locus.length) {
    console.error('getLocus: no weather locus!', dateOpts, weather, locus)
    return
    // throw fail.checkedError("no weather locus", "MissingLocus")
  }

  return locusEnrich(weather, dateOpts, locus, root)
}

function getScope(weather, locusType, type) {
  var scope
  if (locusType == 'Hourly' || type == 'Hourly') {
    scope = 'hourly'
  } else {
    if ((weather.daily && weather.daily.length < 2 && weather.hourly && weather.hourly.length > 1) || (weather.daily.length == 0 && weather.hourly && weather.hourly.length > 0)) {
      // when query weekend weather, there is no weather info / change from 3 to 2
      scope = 'hourly'
    } else {
      scope = 'daily'
    }
  }
  Log.debug('getScope', locusType, type, scope)
  Log.debug('getScope', weather.daily, weather.hourly)
  return scope
}

// Single response handler, for calendar-like functionality.
function weatherFromResponse(weather, now, point, type, tempUnitName, dateOpts, root, responseYesterday) {
  Log.debug('weatherFromResponse', weather, point, type, tempUnitName, dateOpts.tense, dateOpts, root, responseYesterday)
  var history
  var daily
  var today = now.atStartOfDay()

  var solarTimes = Astronomy.parseSolarTimes(root.detailinfo.sunrise.value, root.detailinfo.sunset.value, point, now.getDateTime())
  if (dateOpts.tense == 'Past') {
    history = Historical.getHistoricalWeather(point, tempUnitName, dateOpts, responseYesterday[0], curLocale)
    daily = pushDaily(daily, history)
    weather.daily = pushDaily(weather.daily, daily)
    weather.hourly = Historical.getHistoricalHourlyWeather(point, tempUnitName, responseYesterday[0], solarTimes, curLocale, now)
  } else if (dateOpts.tense == 'Present') {
    weather.now = Current.getCurrentWeather(point, tempUnitName, root, solarTimes, curLocale, now)
    weather.now = [weather.now]
    weather.hourly = Hourly.getHourlyWeather(point, tempUnitName, dateOpts, root, solarTimes, curLocale, now)
    // VIV-14048
    daily = pushDaily(daily, Forecast.getForecastedWeather(point, tempUnitName, dateOpts.context.start, dateOpts.context.end, root, curLocale))
    weather.daily = pushDaily(weather.daily, daily)
  } else {
    daily = pushDaily(daily, Forecast.getForecastedWeather(point, tempUnitName, dateOpts.context.start, dateOpts.context.end, root, curLocale))
    weather.daily = pushDaily(weather.daily, daily)
    weather.hourly = Hourly.getHourlyWeather(point, tempUnitName, dateOpts, root, solarTimes, curLocale, now)
    if (dateOpts.context.start.atStartOfDay().isEqualTo(today) || today.isAfter(dateOpts.context.start.atStartOfDay())) {
      weather.now = Current.getCurrentWeather(point, tempUnitName, root, solarTimes, curLocale, now)
      weather.now = [weather.now]
    }
  }
  return weather
}

// ------------------------------------------------------------
// Implements findWeather function
//   Inputs:
//     where [latitude, longitude],
//     when [dat | dateTime | date interval],
//     type [historical, current conditions, forecast]
//   Outputs: a Weather record
// ------------------------------------------------------------
function findWeather(where, date, dateTime, dateInterval, dateTimeInterval, duration, type, tempUnitName, dustType, $vivContext) {
  Log.debug("findWeather", where, date, dateTime, dateInterval, dateTimeInterval, duration, type, tempUnitName, dustType, $vivContext)
  curLocale = $vivContext.locale
  handsFree = $vivContext.handsFree
  var point = where && where.point
  var latitude = point && point.latitude
  var longitude = point && point.longitude
  if (!where.name) {
    latitude = latitude.toFixed(3)
    longitude = longitude.toFixed(3)
  }
  if (!latitude || !longitude) {
    throw fail.checkedError("missing location", "NullLocation")
  }
  
  if (dateInterval) {
    if (dateInterval.relNamedDateInterval && dateInterval.offset && dateInterval.relNamedDateInterval == 'Week') {
      if (dateInterval.offset == 'This') {
        textDateInfo = 'ThisWeek'
      } else if (dateInterval.offset == 'Next') {
        textDateInfo = 'NextWeek'
      }
    } else if (dateInterval.ambigNamedDateInterval) {
      if (dateInterval.ambigNamedDateInterval == 'x-TodayTomorrow') {
        textDateInfo = 'TodayTomorrow'
      } else if (dateInterval.ambigNamedDateInterval == 'x-ThisWeek') {
        textDateInfo = 'ThisWeek'
      } else if (dateInterval.ambigNamedDateInterval == 'x-NextWeek') {
        textDateInfo = 'NextWeek'
      }
    }
  } else if (dateTimeInterval && dateTimeInterval.namedTimeIntervalRel == 'Weekend') {
    textDateInfo = 'Weekend'
  } else if (date && date.namedDate == 'Tomorrow') {
    textDateInfo = 'Tomorrow'
  }

  var now = dates.ZonedDateTime.now(point)
  var typeNext = typeof type === 'undefined' ? null : String(type)
  var dateOpts = dateOptions(point, now, date, dateTime, dateInterval, dateTimeInterval, duration, null, typeNext)
  if (!dateOpts) {
    return; // For relaxation
    // throw fail.checkedError("out of range date or time", "DurationLimit")
  }
  Log.debug('findWeather', where, dateOpts.tense, 'dateOpts', dateOpts)

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
      lat: latitude,
      lon: longitude
    },
    cacheTime: 10 * 60 * 1000 // 5 minutes
  })
  if (dateOpts.tense == 'Past') {
    responseYesterday = http.getUrl(urlYesterday, {
      format: 'json',
      query: {
        lat: latitude,
        lon: longitude
      },
      cacheTime: 10 * 60 * 1000 // 5 minutes
    })
  }
  
  if (response[0] == undefined) {
    throw fail.checkedError("no weather locus", "MissingLocus")
  }
  if(curLocale == 'zh-CN') {
	//TODO
    response = JSON.parse(JSON.stringify(changeAPIRspsonseToCN.changeAPIRspsonseToCN(response)))
    Log.debug("response", response)
  }
  //TODO
  weatherFromResponse(weather, now, point, String(type), tempUnitName, dateOpts, response[0], responseYesterday)

  var locus = getLocus(dateOpts, weather, response[0])
  if (locus == null) {
    return
  }
  weather.locus = locus
  weather.locus.textDateInfo = textDateInfo
  weather.locus.dustType = dustType
  weather.scope = getScope(weather, weather.locus.type, type)
  if(curLocale == 'zh-CN' && where.name) {
    locus.displayLocation = where.name
  }
  if (dateInterval || duration || textDateInfo == 'Weekend') {
    weather.dialogSummary = Dialog.getSummaryDialog(weather)
  }

  weather.locus.backupWeather = JSON.parse(JSON.stringify(weather))
  // The almanac isn't part of the model, and now we have what we want in the locus.
  Log.debug('findWeather', weather)
  return weather
}

module.exports = {
  findWeather: findWeather
}
