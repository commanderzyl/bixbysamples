// ************************************************************
// weather.JudgeWhenWeatherCondition.js: Find when the weather condition is true
//   for the given weather.
//
// Implemented Functions: weather.JudgeWehnWeatherCondition(condition, weather)
// Author: sr2.lee
// ************************************************************

var Judge = require('lib/judge.js')
var Dialog = require('lib/dialog.js')

module.exports.function = function judgeWhenWeatherCondition(condition, atLeast, atMost, greaterThan, lessThan, weather, $vivContext) {
  var judgement = Judge.checkWeather(condition, atLeast, atMost, greaterThan, lessThan, weather, $vivContext);
  if (judgement.matchType == 'Forecast' && judgement.weatherMatches.length > 0) {
    var judgementSummaryDialog = Dialog.getJudgementSummaryDialog(judgement.weatherMatches);
    judgement.judgementSummary = judgementSummaryDialog;
  }
  return judgement;
}