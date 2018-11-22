var lib = require('./lib/IterationBase.js')
module.exports.function = function RankResult (baseResult, sortStyle) {
  if(baseResult.showStyle == "FlightNotExist"){
    return
  }
  return lib.getOrderedResult(baseResult, sortStyle)
}
