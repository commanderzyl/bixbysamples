var pureCityList = require('./lib/PureCityList.js')
module.exports = {
  function: cityNames
}

function cityNames(departureCity, arrivalCity, airline) {

  var cityArray
  if (departureCity != undefined || arrivalCity != undefined) {
    cityArray = getCityName(departureCity, arrivalCity)
  }

  if (airline != undefined) {
    cityArray = getAirlineNames(airline)
  }

  return cityArray
}

function getAirlineNames(airline) {
  airline = airline.replace(/\s+/g, "")
  var list = getAirList()
  var cityArray = []
  for (var j = 0; j < list.length; j++) {
    for (var k = 0; k < list[j].length; k++) {
      var lineName = list[j][k]
      if (lineName.indexOf(airline.toLowerCase()) !== -1 && cityArray.indexOf(lineName) == -1 && !(lineName == '' || lineName == null || typeof (lineName) == undefined)) {
        cityArray.push(list[j][0])
        break
      }
    }
  }

  console.log("getAirlineNames" + cityArray.length)
  var array = []

  if (cityArray.length != 0) {
    for (var i = 0; i < cityArray.length; i++) {
      var object = {}
      object.airline = cityArray[i]
      array.push(object)
    }
  }

  return array
}

function getAirList() {

  return [
    ['奥凯航空', 'aokaihangkong', 'akhk'],
    ['北京首都航空', 'beijingshouduhangkong', 'bjsdhk'],
    ['成都航空', 'chengduhangkong', 'cdhk'],
    ['春秋航空', 'chunqiuhangkong', 'cqhk'],
    ['东方航空', 'dongfanghangkong', 'dfhk'],
    ['海南航空', 'hainanhangkong', 'hnhk'],
    ['河北航空', 'hebeihangkong', 'hbhk'],
    ['华夏航空', 'huaxiahangkong', 'hxhk'],
    ['吉祥航空', 'jixianghangkong', 'jxhk'],
    ['九元航空', 'jiuyuanhangkong', 'jyhk'],
    ['厦门航空', 'shamenhangkong', 'xmhk'],
    ['山东航空', 'shandonghangkong', 'sdhk'],
    ['上海航空', 'shanghaihangkong', 'shhk'],
    ['深圳航空', 'shenzhenhangkong', 'shk'],
    ['四川航空', 'sichuanhangkong', 'schk'],
    ['天津航空', 'tianjinhangkong', 'tjhk'],
    ['西部航空', 'xibuhangkong', 'xbhk'],
    ['西藏航空', 'xicanghangkong', 'xchk'],
    ['云南祥鹏航空', 'yunnanxiangpenghangkong', 'ynxphk'],
    ['云南英安航空', 'yunnanyinganhangkong', 'ynyahk'],
    ['长城航空', 'changchenghangkong', 'cchk'],
    ['长龙航空', 'changlonghangkong', 'clhk'],
    ['中国国际航空', 'zhongguoguojihangkong', 'zggjhk'],
    ['中国联合航空', 'zhongguolianhehangkong', 'zglhhk'],
    ['中国南方航空', 'zhongguonanfanghangkong', 'zgnfhk'],
    ['重庆航空', 'chongqinghangkong', 'cqhk'],
    ["昆明航空", "kunminghangkong", 'kmhk'],
    ["香港航空", "xiangganghangkong", 'xghk'],
    ["国泰港龙航空", "guotaiganglonghangkong", 'gtglhk']
  ]
}

function getCityName(departureCity, arrivalCity) {

  var cityName;
  if (departureCity != undefined) {
    cityName = departureCity.replace(/\s+/g, "")
  } else {
    cityName = arrivalCity.replace(/\s+/g, "")
  }

  var cityArray = []
  var pureCities = pureCityList.citynames

  for (var j = 0; j < pureCities.length; j++) {
    for (var k = 0; k < pureCities[j].length; k++) {
      var foreignCity = pureCities[j][k]
      if (foreignCity.indexOf(cityName.toLowerCase()) !== -1 && cityArray.indexOf(foreignCity) == -1 && !(foreignCity == '' || foreignCity == null || typeof (foreignCity) == undefined)) {
        cityArray.push(pureCities[j][0])
        break
      }
    }
  }

  var array = []

  if (cityArray.length != 0) {
    for (var i = 0; i < cityArray.length; i++) {
      var object = {}
      if (departureCity != undefined) {
        object.departureCity = cityArray[i]
      } else if (arrivalCity != undefined) {
        object.arrivalCity = cityArray[i]
      }

      array.push(object)
    }
  }

  return array
}
