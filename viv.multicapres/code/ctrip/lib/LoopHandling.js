module.exports = {
  getWeek: getWeek,
  handleDepartTime: handleDepartTime,
  getDapartureDateInfo: getDapartureDateInfo,
  formatDate: formatDate
}

function getWeek(week) {
  var weekName = "";
  switch (week) {
    case 1:
      weekName = "周一"
      break;
    case 2:
      weekName = "周二"
      break;
    case 3:
      weekName = "周三"
      break;
    case 4:
      weekName = "周四"
      break;
    case 5:
      weekName = "周五"
      break;
    case 6:
      weekName = "周六"
      break;
    case 7:
      weekName = "周日"
      break;
    default:
      weekName = "其他"
  };
  return weekName
}

function handleDepartTime(namedTimeIntervalRel) {
  var transferTime;
  var namedTimeInChinese

  if (namedTimeIntervalRel == "BeforeDawn" || namedTimeIntervalRel == "Dawn") {
    transferTime = "00:00_05:00"
    namedTimeInChinese = "凌晨"
  } else if (namedTimeIntervalRel == "EarlyMorning") {
    transferTime = "04:00_10:00"
    namedTimeInChinese = "早晨"
  } else if (namedTimeIntervalRel == "Morning") {
    transferTime = "05:00_12:00"
    namedTimeInChinese = "上午"
  } else if (namedTimeIntervalRel == "Noon") {
    transferTime = "11:00_14:00"
    namedTimeInChinese = "中午"
  } else if (namedTimeIntervalRel == "Afternoon") {
    transferTime = "12:00_19:00"
    namedTimeInChinese = "下午"
  } else if (namedTimeIntervalRel == "Dusk") {
    transferTime = "18:00_21:00"
    namedTimeInChinese = "黄昏"
  } else if (namedTimeIntervalRel == "Evening") {
    transferTime = "16:00_24:00"
    namedTimeInChinese = "晚上"
  } else if (namedTimeIntervalRel == "Night") {
    transferTime = "20:00_24:00"
    namedTimeInChinese = "夜间"
  }

  return {
    transferTime: transferTime,
    namedTimeInChinese: namedTimeInChinese
  }
}

function getDapartureDateInfo(date) {
  console.log("++++++date+++++++")
  var requestDate;
  var userInputDate;
  var detailPageDate;
  var year;
  var timeDate

  if (date.length > 0) {

    var currentYear = new dates.ZonedDateTime("UTC+08:00").getYear();
    var currentMonth = new dates.ZonedDateTime("UTC+08:00").getMonth();
    var currentDay = new dates.ZonedDateTime("UTC+08:00").getDay();

    if (date[date.length - 1].year == currentYear && date[date.length - 1].month == currentMonth && date[date.length - 1].day == currentDay) {
      requestDate = date[date.length - 1].year + "-" + date[date.length - 1].month + "-" + date[date.length - 1].day;
      userInputDate = date[date.length - 1].month + "月" + date[date.length - 1].day + "日";
      detailPageDate = formatDate(date[date.length - 1].year, date[date.length - 1].month, date[date.length - 1].day);
      year = date[date.length - 1].year;
      timeDate = date[date.length - 1]
    } else {
      requestDate = date[0].year + "-" + date[0].month + "-" + date[0].day;
      detailPageDate = formatDate(date[0].year, date[0].month, date[0].day);
      year = date[0].year;
      if (date[0].year > currentYear) {
        userInputDate = date[0].year + "年" + date[0].month + "月" + date[0].day + "日";
      } else {
        userInputDate = date[0].month + "月" + date[0].day + "日";
      }
      timeDate = date[0]
    }
  }

  if (!checkDateIsFuture(timeDate)) {
    console.log("++++++++timeDate++++++++")
    throw fail.checkedError("出发日期有问题", "DepartureDateError")
  }

  return {
    requestDate: requestDate,
    userInputDate: userInputDate,
    departDate: detailPageDate,
    year: year,
    timeDate: timeDate
  }
}

function formatDate(year, month, day) {
  var formatDate = "";
  var currentYear = new dates.ZonedDateTime("UTC+08:00").getYear()
  if (year > currentYear) {
    formatDate += (year + "/")
  }

  if (month < 10) {
    if (day < 10) {
      formatDate += '0' + month + "/" + '0' + day;
    } else {
      formatDate += '0' + month + "/" + day;
    }
  } else {
    if (day < 10) {
      formatDate += month + "/" + '0' + day;
    } else {
      formatDate += month + "/" + day;
    }
  }
  return formatDate;
}

function checkDateIsFuture(departureDate) {

  var year = new dates.ZonedDateTime("UTC+08:00").getYear()
  var month = new dates.ZonedDateTime("UTC+08:00").getMonth()
  var day = new dates.ZonedDateTime("UTC+08:00").getDay()

  if (departureDate.year < year) {
    return false
  } else if (departureDate.year === year) {
    if (departureDate.month < month || (departureDate.month === month && departureDate.day < day)) {
      return false
    }
  }
  return true
}
