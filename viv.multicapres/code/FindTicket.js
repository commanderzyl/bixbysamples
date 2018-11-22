module.exports.function = function findTcket (arrivalCity, ticket, weather, newsInfo) {
  console.log("findTicket", arrivalCity, ticket, weather, newsInfo);  
  month = [];
  day = [];
  for (var index = 0; index < weather.daily.length; index++) {
    month.push((""+weather.daily[index].when.month).substring(0, 2));
    day.push((""+weather.daily[index].when.day).substring(0, 2));
  }
  console.log(month, day);
  return {
            arrivalCity: arrivalCity,
            ticket: ticket,
            weather: weather,
            newsInfo: newsInfo,
            month: month,
            day: day,
         };
}
