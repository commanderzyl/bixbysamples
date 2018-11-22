var Log = require('lib/log.js')

exports.getSummaryDialog = function getSummaryDialog(weather) {
  var startDate, endDate
  var condition, conditionResult
  var conditionResultSet = []
  if (weather.now) {
    startDate = weather.now[0].when.date
    condition = weather.now[0].condition
  }
  for (var i=0; i<weather.daily.length; i++) {
    if (!condition) {
      startDate = weather.daily[i].when
      condition = weather.daily[i].condition
      continue
    }
    if (condition == weather.daily[i].condition) {
      continue;
    } else {
      if (i > 0) {
        endDate = weather.daily[i-1].when
      } else {
        endDate = startDate
      }
      
      conditionResult = {
        startDate: startDate,
        endDate: endDate,
        condition: condition
      }
      conditionResultSet.push(conditionResult)
      
      startDate = weather.daily[i].when
      condition = weather.daily[i].condition
    }
  }
  if (weather.daily && weather.daily.length > 0) {
    conditionResult = {
      startDate: startDate,
      endDate: weather.daily[weather.daily.length-1].when,
      condition: condition
    }
    conditionResultSet.push(conditionResult)
  }
  Log.debug("ConditionSummaryDialog", conditionResultSet)
  
  var fineDustLevel, fineDustResult
  var fineDustResultSet = []
  if (weather.locus.onlyKR) {
    if (weather.now) {
      startDate = weather.now[0].when.date
      fineDustLevel = weather.now[0].fineDust.level
    }
    for (var i=0; i<weather.daily.length; i++) {
      if (!fineDustLevel) {
        startDate = weather.daily[i].when
        fineDustLevel = weather.daily[i].fineDust.level
        continue
      }
      if (fineDustLevel == weather.daily[i].fineDust.level) {
        continue;
      } else {
        if (i > 0) {
          endDate = weather.daily[i-1].when
        } else {
          endDate = startDate
        }

        fineDustResult = {
          startDate: startDate,
          endDate: endDate,
          fineDustLevel: fineDustLevel
        }
        fineDustResultSet.push(fineDustResult)

        startDate = weather.daily[i].when
        fineDustLevel = weather.daily[i].fineDust.level
      }
    }
    if (weather.daily && weather.daily.length > 0) {
      fineDustResult = {
        startDate: startDate,
        endDate: weather.daily[weather.daily.length-1].when,
        fineDustLevel: fineDustLevel
      }
      fineDustResultSet.push(fineDustResult)
    }
  }
  Log.debug("FineDustSummaryDialog", fineDustResultSet)

  var ultraFineDustLevel, ultraFineDustResult
  var ultraFineDustResultSet = []
  if (weather.locus.onlyKR) {
    if (weather.now) {
      startDate = weather.now[0].when.date
      ultraFineDustLevel = weather.now[0].ultraFineDust.level
    }
    for (var i=0; i<weather.daily.length; i++) {
      if (!ultraFineDustLevel) {
        startDate = weather.daily[i].when
        ultraFineDustLevel = weather.daily[i].ultraFineDust.level
        continue
      }
      if (ultraFineDustLevel == weather.daily[i].ultraFineDust.level) {
        continue;
      } else {
        if (i > 0) {
          endDate = weather.daily[i-1].when
        } else {
          endDate = startDate
        }

        ultraFineDustResult = {
          startDate: startDate,
          endDate: endDate,
          ultraFineDustLevel: ultraFineDustLevel
        }
        ultraFineDustResultSet.push(ultraFineDustResult)

        startDate = weather.daily[i].when
        ultraFineDustLevel = weather.daily[i].ultraFineDust.level
      }
    }
    if (weather.daily && weather.daily.length > 0) {
      ultraFineDustResult = {
        startDate: startDate,
        endDate: weather.daily[weather.daily.length-1].when,
        ultraFineDustLevel: ultraFineDustLevel
      }
      ultraFineDustResultSet.push(ultraFineDustResult)
    }
  }
  Log.debug("UltraFineDustSummaryDialog", ultraFineDustResultSet)

  var CAIlevel, CAIResult
  var CAIResultSet = []
  if (weather.locus.onlyKR) {
    if (weather.now) {
      startDate = weather.now[0].when.date
      CAIlevel = weather.now[0].CAI.level
    }
    for (var i=0; i<weather.daily.length; i++) {
      if (!CAIlevel) {
        startDate = weather.daily[i].when
        CAIlevel = weather.daily[i].CAI.level
        continue
      }
      if (CAIlevel == weather.daily[i].CAI.level) {
        continue;
      } else {
        if (i > 0) {
          endDate = weather.daily[i-1].when
        } else {
          endDate = startDate
        }

        CAIResult = {
          startDate: startDate,
          endDate: endDate,
          CAIlevel: CAIlevel
        }
        CAIResultSet.push(CAIResult)

        startDate = weather.daily[i].when
        CAIlevel = weather.daily[i].CAI.level
      }
    }
    if (weather.daily && weather.daily.length > 0) {
      CAIResult = {
        startDate: startDate,
        endDate: weather.daily[weather.daily.length-1].when,
        CAIlevel: CAIlevel
      }
      CAIResultSet.push(CAIResult)
    }
  }
  Log.debug("CAISummaryDialog", CAIResultSet)
  
  var precipitationType
  var probabilityOfPrecipitation, probabilityOfPrecipitationResult
  var probabilityOfPrecipitationResultSet = []
  if (weather.now && weather.hourly && weather.hourly.length > 0) {
    startDate = weather.now[0].when.date
    precipitationType = weather.hourly[0].precipitationType
    probabilityOfPrecipitation = weather.hourly[0].probabilityOfPrecipitation
  }
  for (var i=0; i<weather.daily.length; i++) {
    if (!probabilityOfPrecipitation) {
      startDate = weather.daily[i].when
      precipitationType = weather.daily[i].precipitationType
      probabilityOfPrecipitation = weather.daily[i].probabilityOfPrecipitation
      continue
    }
    if (probabilityOfPrecipitation == weather.daily[i].probabilityOfPrecipitation) {
      continue;
    } else {
      if (i > 0) {
        endDate = weather.daily[i-1].when
      } else {
        endDate = startDate
      }
      
      probabilityOfPrecipitationResult = {
        startDate: startDate,
        endDate: endDate,
        precipitationType: precipitationType,
        probabilityOfPrecipitation: probabilityOfPrecipitation
      }
      probabilityOfPrecipitationResultSet.push(probabilityOfPrecipitationResult)
      
      startDate = weather.daily[i].when
      probabilityOfPrecipitation = weather.daily[i].probabilityOfPrecipitation
    }
  }
  if (weather.daily && weather.daily.length > 0) {
    probabilityOfPrecipitationResult = {
      startDate: startDate,
      endDate: weather.daily[weather.daily.length-1].when,
      precipitationType: precipitationType,
      probabilityOfPrecipitation: probabilityOfPrecipitation
    }
    probabilityOfPrecipitationResultSet.push(probabilityOfPrecipitationResult)
  }
  Log.debug("probabilityOfPrecipitationSummaryDialog", probabilityOfPrecipitationResultSet)
  
  return {
    condition: conditionResultSet,
    fineDust: fineDustResultSet,
    ultraFineDust: ultraFineDustResultSet,
    CAI: CAIResultSet,
    probabilityOfPrecipitation: probabilityOfPrecipitationResultSet
  }
}

exports.getJudgementSummaryDialog = function getJudgementSummaryDialog(weatherMatches) {
  var startDate, endDate
  var convertedStart, convertedDate
  var delta = 1
  var judgementResult
  var judgementResultSet = []
  
  startDate = weatherMatches[0].date
  convertedStart = dates.ZonedDateTime.fromDate(startDate).atStartOfDay()
  
  for (var i=1; i<weatherMatches.length; i++) {
    convertedDate = dates.ZonedDateTime.fromDate(weatherMatches[i].date).atStartOfDay()
    if (convertedStart.plusDays(delta).isEqualTo(convertedDate)) {
      console.debug('getJudgementSummaryDialog', 'Same', convertedStart.plusDays(delta), convertedDate)
      delta++;
      continue
    } else {
      console.debug('getJudgementSummaryDialog', 'Not Same', convertedStart.plusDays(delta), convertedDate)
      endDate = weatherMatches[i-1].date
      judgementResult = {
        startDate: startDate,
        endDate: endDate
      }
      judgementResultSet.push(judgementResult)
      startDate = weatherMatches[i].date
      convertedStart = dates.ZonedDateTime.fromDate(startDate).atStartOfDay()
      delta = 1;
    }
  }
  judgementResult = {
    startDate: startDate,
    endDate: weatherMatches[weatherMatches.length-1].date
  }
  judgementResultSet.push(judgementResult)
  Log.debug('getJudgementSummaryDialog', judgementResultSet)
  return judgementResultSet
}