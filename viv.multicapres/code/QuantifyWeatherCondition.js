// weather.QuantifyWeatherCondition
var Log = require('lib/log.js')

// Preconditions (only run this function if inputs are valid)
module.exports.preconditions = []

// Tests
module.exports.tests = [{
    input: {
        condition: 'required',
        locus: 'required'
    },
    output: [
        null
    ]
}]

module.exports.function = function quantifyWeatherCondition(condition, weather) {
  Log.debug('quantifyWeatherCondition', String(condition), weather)
  var locus = weather.locus
  var quantity

  switch (String(condition)) {
    case 'blizzard':
    case 'chanceflurries':
    case 'chancesleet':
    case 'Chancesnow':
    case 'flurries':
    case 'hail':
    case 'Sleet':
    case 'Snow':
      quantity = {
        height: locus.snowfall,
        type: 'snowfall'
      }
      break
    case 'flood':
    case 'Rain':
    case 'Chancerain':
    case 'chancetstorms':
    case 'tstorms':
      quantity = {
        height: locus.rainfall,
        type: 'rainfall'
      }
      break
    default:
      throw fail.checkedError(condition + ' not supported', 'UnsupportedCondition', {})
  }
  return quantity
}