var Judge = require('lib/judge.js')
var Weather = require('lib/weather.js')

function assert(val, message) {
  if (!val) {
    throw String(message)
  }
}

function findWeather(props) {
  return Weather.findWeather(
    props.where,
    props.date,
    props.dateTime,
    props.forecastLength,
    props.dateInterval,
    props.dateTimeInterval,
    props.type,
    props.alertType,
    props.tempUnitName,
    props.tense)
}

function judgeWeather(props) {
  return Judge.checkWeather(
    props.condition,
    props.atLeast,
    props.atMost,
    props.greaterThan,
    props.lessThan,
    props.weather)
}

module.exports = {
  FindWeather: {
    SyntaxCheck: function () {
      return "syntax check"
    },

    TemperatureNow: function () {
      var when = dates.ZonedDateTime.now()
      var weather = findWeather({
        where: {
          point: {
            latitude: 37.552810199999996,
            longitude: -122.25196389999998
          }
        },
        dateTime: when.getDateTime()
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.type === 'Current', 'locus type is not current')
      return 'what is the temperature right now?'
    },

    RainThreeWeeksFromToday: function () {
      var when = dates.ZonedDateTime.now().plusDays(21)
      var weather = findWeather({
        where: {
          point: {
            latitude: 37.552810199999996,
            longitude: -122.25196389999998
          }
        },
        date: when.getDateTime().date,
        tense: 'Future'
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.icon, 'missing locus icon')
      assert(weather.locus.type === 'Typical', 'locus type is not typical')
      assert(weather.typical, 'missing daily')

      var judgement = judgeWeather({
        condition: 'Rain',
        weather: weather
      })
      assert(judgement, 'missing judgement')
      assert(judgement.condition === 'Rain', 'judgement condition is not rain')
      assert(typeof judgement.judgement === 'boolean', 'missing judgement status')
      assert(judgement.tense === 'Future', 'judgement tense is not Future')
      assert(judgement.weather, 'missing judgement.weather')
      return 'will it rain three weeks from today'
    },

    RainThisWeekPortlandOregon: function () {
      var monday = dates.ZonedDateTime.now()
      var count = 0
      while (count < 7 && monday.getDayOfWeek() !== 1) {
        monday = monday.minusDays(1)
        count++
      }
      assert(monday.getDayOfWeek() === 1, 'could not find start of week')
      var weather = findWeather({
        where: {
          point: {
            latitude: 45.52345,
            longitude: -122.67621
          }
        },
        dateInterval: {
          relNamedDateInterval: 'Week',
          offset: 'This',
          start: monday.getDateTime().date,
          end: monday.plusDays(6).getDateTime().date
        },
        tense: 'Future'
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.icon, 'missing locus icon')
      assert(weather.hourly.length, 'missing hourly')
      assert(weather.daily.length, 'missing daily')
      return 'will it rain this week in portland, oregon'
    },

    WeatherBarringtonIllinois: function () {
      var weather = findWeather({
        where: {
          point: {
            latitude: 42.15391,
            longitude: -88.13619
          }
        }
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.icon, 'missing locus icon')
      assert(weather.locus.radarImageUrl, 'missing locus radarImageUrl')
      assert(weather.locus.type === 'Current', 'locus type not current')
      assert(weather.hourly.length, 'missing hourly')
      assert(weather.daily.length, 'missing daily')
      return 'weather in barrington illinois'
    },

    Warmer70GoldenGateFive: function () {
      var weather = findWeather({
        where: {
          point: {
            latitude: 37.81965,
            longitude: -122.47886
          }
        },
        dateTime: dates.ZonedDateTime.now().plusDays(2).withHour(17).withMinute(0).withSecond(0).getDateTime(),
        tense: 'Future'
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.type === 'Hourly', 'locus type not hourly')
      assert(weather.hourly.length === 6, 'missing hourly context')

      var judgement = judgeWeather({
        greaterThan: {
          unit: {
            name: 'Fahrenheit',
            abbreviation: 'F'
          },
          value: 70.0
        },
        weather: weather
      })
      assert(judgement, 'missing judgement')
      assert(judgement.greaterThan, 'judgement not greaterThan')
      assert(judgement.greaterThan.value === 70, 'judgement not greaterThan 70')
      assert(typeof judgement.judgement === 'boolean', 'missing judgement status')
      assert(judgement.tense === 'Future', 'judgement tense is not Future')
      assert(judgement.weather, 'missing judgement.weather')
      return 'warmer than 70 degrees near the Golden Gate Bridge after 5 pm the day after tomorrow'
    },

    WeatherOnForecastBoundary: function () {
      var friday = dates.ZonedDateTime.now().plusDays(9).atStartOfDay().withHour(18)
      var weather = findWeather({
        where: {
          point: {
            latitude: 37.77493,
            longitude: -122.41942
          }
        },
        dateTimeInterval: {
          relNamedDateInterval: 'Weekend',
          offset: 'Next',
          start: friday.getDateTime(),
          end: friday.plusDays(2).atEndOfDay().getDateTime()
        }
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.type === 'Typical')
      assert(weather.daily[0].type === 'Forecast')
      return 'weather in san francisco next weekend'
    },

    // Was it raining in Seattle three Thursdays ago?

    // when will it rain in miami

    TypicalCairoOctober: function () {
      var weather = findWeather({
        where: {
          point: {
            latitude: 30.06263,
            longitude: 31.24967
          }
        },
        dateInterval: {
          start: {
            year: 2016,
            month: 10,
            day: 1
          },
          end: {
            year: 2016,
            month: 10,
            day: 31
          }
        },
        type: 'Typical'
      })
      assert(weather.locus, 'missing locus')
      assert(weather.locus.icon, 'missing locus icon')
      assert(weather.locus.type === 'Typical', 'locus type not typical')
      return 'typical weather for Cairo in October'
    }
  }
}
