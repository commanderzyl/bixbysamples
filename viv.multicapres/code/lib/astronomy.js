var Log = require('lib/log.js')
// username: acheyer2, Six Five project
function parseSolarTimes(sunrise, sunset, where, date) {
  if (!sunrise) { 
    sunrise = '06:00'
  }
  if (!sunset) { 
    sunset = '18:00'
  }
  
  var solarTimes = {
    sunrise: {
      time: formatTime(sunrise, date, where),
      location: where
    },
    sunset: {
      time: formatTime(sunset, date, where),
      location: where
    }
  };
  Log.debug("[Astronomy] parseSolarTimes", solarTimes)
  return solarTimes;
}

function parseLunarTimes(moonrise, moonset, where, date) {
  var lunarTimes = {
    moonrise: {
      time: formatTime(moonrise, date, where),
      location: where
    },
    moonset: {
      time: formatTime(moonset, date, where),
      location: where
    }
  };
  Log.debug("[Astronomy] parseLunarTimes", lunarTimes)
  return lunarTimes;
}

// Convert a time into a date time for a given location. Assumes current date.
function formatTime(time, date, where) {
  if (time == '--:--') {
    return undefined
  }
  
  var dateTime
  if (time.length > 0) {
    var strArray = time.split(':')
    dateTime = {
      date: {
        year: date.date.year,
        month: date.date.month,
        day: date.date.day
      },
      time: {
        hour: strArray[0],
        minute: strArray[1],
        second: 0
      }
    }
  }
  dates.ZonedDateTime.fromDateTime(dateTime)
  return dateTime;
}

// Check that "when" matches the current date
function isToday(when) {
  if (!when) {
    return true;
  } else {
    var now = dates.ZonedDateTime.now();
    var isToday = (now.getYear() === when.year) && (now.getMonth() === when.month) && (now.getDay() === when.day);
    return isToday;
  }
}

exports.parseSolarTimes = parseSolarTimes
exports.parseLunarTimes = parseLunarTimes
exports.isToday = isToday;