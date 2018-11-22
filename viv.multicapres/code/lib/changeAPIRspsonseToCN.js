// ************************************************************
// changeAPIRspsonseToCN.js
//
// TODO: translate CN API response to common response
// ************************************************************
var Log = require('lib/log.js')

function changeAPIRspsonseToCN (response) {
  Log.debug("changeAPIRspsonseToCN", response)
  
  detailinfo_items = {
    "sunrise":"sunrise",
    "sunset":"sunset",
    "uvi":"idx_uv",
    "humi":"humi",
    "wdir":"wdir",
    "wspd":"wndpow",
    "wndpow":"wndpow",
    "visi":"visi"
  }
  
  widget_list = ["pm10", "pm25"]
  
  air_list = ["pm10", "pm25"]
  
  khai_items = {
    "khai":"aqi"
  }
  
  // translate day
  for (var day in response[0].day) {
    x="day"+day
    response[0][x] = response[0].day[day]
    try {
      response[0][x].pop = response[0].day[day].pop_day
    } catch (TypeError) {
      continue
    }
  }
  
  // translate hour
  for (var hour in response[0].hour) {
    x = "hour"+hour
    response[0][x] = response[0].hour[hour]
  }
  
  // translate datailinfo
  response[0].detailinfo = {}
  for (var item in detailinfo_items) {
    x = detailinfo_items[item]
    try {
      response[0].detailinfo[item] = {value: response[0][x]}
    } catch(TypeError){
      continue
    }
  }
  
  // translate widget
  response[0].widget = {}
  for (var item in widget_list) {
    try {
      response[0].widget[widget_list[item]]  = {value: response[0][widget_list[item]], level:response[0][widget_list[item] + "level"]}
    } catch(TypeError){
      continue
    }
  }
  
  // translate air
  response[0].air = {}
  for (var item in air_list) {
    try {
      response[0].air[air_list[item]]  = {value: response[0][air_list[item]], level:response[0][air_list[item] + "level"]}
    } catch(TypeError){
      continue
    }
  }
  
  // translate voice
  response[0].voice = {}
  for (var item in khai_items) {
    x = khai_items[item]
    try {
      response[0].voice[item] = response[0][x]
    } catch(TypeError){
      continue
    }
  }
  
  Log.debug("changeAPIRspsonseToCNResult", response)
  return response
}

function get_set() {
  
}
module.exports = {
  changeAPIRspsonseToCN: changeAPIRspsonseToCN
}