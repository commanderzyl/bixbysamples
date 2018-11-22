module.exports.function = function seeAllResult (baseResult) {
  if(baseResult.showStyle == "FlightNotExist"){
    return
  }
  baseResult.showStyle = "queryMore"
  return baseResult
}
