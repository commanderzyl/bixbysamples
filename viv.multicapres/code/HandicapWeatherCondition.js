// weather.HandicapWeatherCondition
var Log = require('lib/log.js')

// Preconditions (only run this function if inputs are valid)
module.exports.preconditions = []

// Tests
module.exports.tests = [{
  input: {
    condition: 'required',
    weather: 'required'
  },
  output: [
    null
  ]
}]

module.exports.function = function handicapWeatherCondition(condition, weather) {
  Log.debug('handicapWeatherCondition', String(condition), weather)
  var locus = weather.locus
  var probability = {
    condition: condition
  }

  // TODO look for planner output: weather.ProbabilityOfHumidDay etc.

  switch (String(condition)) {
    case 'blizzard':
    case 'chanceflurries':
    case 'chancesleet':
    case 'Chancesnow':
    case 'flurries':
    case 'hail':
    case 'Sleet':
    case 'Snow':
      if (locus.PrecipitationType === "Snow") {
        probability.percentage = locus.probabilityOfPrecipitation
      }
      break

    case 'Rain':
    case 'rain':
    case 'Chancerain':
    case 'chancetstorms':
    case 'tstorms':
      if (locus.PrecipitationType !== "Snow") {
        probability.percentage = locus.probabilityOfPrecipitation
      }
      break

      default:
      if (String(condition) === String(locus.condition)) {
        probability.percentage = 100
      }
  }
  if (probability.percentage == undefined && locus.type == 'Current' && weather.hourly && weather.hourly[0].precipitationType == String(condition)) {
    probability.percentage = weather.hourly[0].probabilityOfPrecipitation
  }
  return probability
}