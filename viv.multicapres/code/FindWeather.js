// ************************************************************
// FindWeather.js
//   Encapsulates Weather Underground's API
//
// Implemented Functions: findWeather()
//
// Doc: https://docs.google.com/a/sixfivelabs.com/document/d/1KB6rsO0eoW1rdul9PoUhq4aI768PcQdDiVUptVUj2Wc/edit
// Author: Adam Cheyer
// ************************************************************

var Weather = require('./lib/weather.js')

module.exports = {
    function: Weather.findWeather
}