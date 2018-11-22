var airlineMap = require('./lib/AirlineMap.js')
module.exports.function = function searchAirline(airline) {

  var array = airlineMap.flightNames
  var string
  for (var i = 0; i < array.length; i++) {
    if (airline.indexOf(array[i][0]) !== -1) {
      string = array[i][1]
      break
    }
  }
  return string
}