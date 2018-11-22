// ************************************************************
// solarCalculator.js: Solar calculations based on NOAA calculator.
// (http://www.esrl.noaa.gov/gmd/grad/solcalc/)
// Good for years -1000 to +3000.
//
// Author: Andrew Roberts
// ************************************************************

// ------------------------------------------------------------
// Implements weather.GetSolarTime function
//   Inputs:  where [latitude, longitude], when [time.DateTimeExpression] (optional)
//   Outputs: weather.Sunrise, weather.Sunset and weather.SolarNoon
// ------------------------------------------------------------
function calculateSolarTimes(where, when) {

    var point = where.point;
    var lat = point.latitude;
    var lng = point.longitude;

    var reqDate = new dates.ZonedDateTime(point);
    // if requested for a particular day, set it so we get the correct DST check
    if(when) {
        reqDate = reqDate.withYear(when.year).withMonth(when.month).withDay(when.day);
    }
    
    var julianDay = getJulianDay(reqDate);
    var tz = reqDate.getTimeZoneOffset() / 3600;
    
    // see if it's DST
    var dst = reqDate.isDST();
    var solarNoon = calcSolNoon(julianDay, lng, tz, dst)
    solarNoon.time.timezone = reqDate.getTimeZoneId();
    var sunrise = calcSunriseSet(1, julianDay, lat, lng, tz, dst)
    sunrise.time.timezone = reqDate.getTimeZoneId();
    var sunset  = calcSunriseSet(0, julianDay, lat, lng, tz, dst)
    sunset.time.timezone = reqDate.getTimeZoneId();
    
    // used to calculate the solar azimuth/elevation at the specified time, which we're not currently using
    //var tl = getTimeLocal(nowAtLocation)
    //var total = jday + tl/1440.0 - tz/24.0
    // var T = calcTimeJulianCent(total)
    // var alEl = calcAzEl(1, T, tl, lat, lng, tz)
    
    return {
        sunrise: {
            time: {
                date: sunrise.date,
                time: sunrise.time
            },
            location: where
        },
        sunset: {
            time: {
                date: sunset.date,
                time: sunset.time
            },
            location:where
        },
        solarNoon: {
            time: {
                date: solarNoon.date,
                time: solarNoon.time
            },
            location: where
        }
    }
}


function calcTimeJulianCent(julianDay) {
    return (julianDay - 2451545.0)/36525.0;
}

function calcJDFromJulianCent(julianCent) {
    return julianCent * 36525.0 + 2451545.0;
}

function isLeapYear(year) {
    return ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0);
}

function calcDoyFromJD(julianDay) {
    var z = Math.floor(julianDay + 0.5);
    var f = (julianDay + 0.5) - z;
    if (z < 2299161) {
        var A = z;
    } else {
        alpha = Math.floor((z - 1867216.25)/36524.25);
        var A = z + 1 + alpha - Math.floor(alpha/4);
    }
    var B = A + 1524;
    var C = Math.floor((B - 122.1)/365.25);
    var D = Math.floor(365.25 * C);
    var E = Math.floor((B - D)/30.6001);
    
    var day = B - D - Math.floor(30.6001 * E) + f;
    var month = (E < 14) ? E - 1 : E - 13;
    var year = (month > 2) ? C - 4716 : C - 4715;
    
    var k = (isLeapYear(year) ? 1 : 2);
    return Math.floor((275 * month)/9) - k * Math.floor((month + 9)/12) + day -30;
}


function radToDeg(angleRad) {
    return (180.0 * angleRad / Math.PI);
}

function degToRad(angleDeg) {
    return (Math.PI * angleDeg / 180.0);
}

function calcGeomMeanLongSun(t) {
    var L0 = 280.46646 + t * (36000.76983 + t*(0.0003032))
    while(L0 > 360.0) {
        L0 -= 360.0
    }
    while(L0 < 0.0) {
        L0 += 360.0
    }
    return L0;		// in degrees
}

function calcGeomMeanAnomalySun(t) {
    return 357.52911 + t * (35999.05029 - 0.0001537 * t);		// in degrees
}

function calcEccentricityEarthOrbit(t) {
    return 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
}

function calcSunEqOfCenter(t) {
    var m = calcGeomMeanAnomalySun(t);
    var mrad = degToRad(m);
    var sinm = Math.sin(mrad);
    var sin2m = Math.sin(mrad+mrad);
    var sin3m = Math.sin(mrad+mrad+mrad);
    return sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;		// in degrees
}

function calcSunTrueLong(t) {
    var l0 = calcGeomMeanLongSun(t);
    var c = calcSunEqOfCenter(t);
    return l0 + c;		// in degrees
}

function calcSunTrueAnomaly(t) {
    var m = calcGeomMeanAnomalySun(t);
    var c = calcSunEqOfCenter(t);
    return m + c;		// in degrees
}

function calcSunRadVector(t) {
    var v = calcSunTrueAnomaly(t);
    var e = calcEccentricityEarthOrbit(t);
    return (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(degToRad(v)));		// in AUs
}

function calcSunApparentLong(t) {
    var o = calcSunTrueLong(t);
    var omega = 125.04 - 1934.136 * t;
    return o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));		// in degrees
}

function calcMeanObliquityOfEcliptic(t) {
    var seconds = 21.448 - t*(46.8150 + t*(0.00059 - t*(0.001813)));
    return 23.0 + (26.0 + (seconds/60.0))/60.0;		// in degrees
}

function calcObliquityCorrection(t) {
    var e0 = calcMeanObliquityOfEcliptic(t);
    var omega = 125.04 - 1934.136 * t;
    return e0 + 0.00256 * Math.cos(degToRad(omega));		// in degrees
}

function calcSunRtAscension(t) {
    var e = calcObliquityCorrection(t);
    var lambda = calcSunApparentLong(t);
    var tananum = (Math.cos(degToRad(e)) * Math.sin(degToRad(lambda)));
    var tanadenom = (Math.cos(degToRad(lambda)));
    return radToDeg(Math.atan2(tananum, tanadenom));		// in degrees
}

function calcSunDeclination(t) {
    var e = calcObliquityCorrection(t);
    var lambda = calcSunApparentLong(t);
    
    var sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
    return radToDeg(Math.asin(sint));		// in degrees
}

function calcEquationOfTime(t) {
    var epsilon = calcObliquityCorrection(t);
    var l0 = calcGeomMeanLongSun(t);
    var e = calcEccentricityEarthOrbit(t);
    var m = calcGeomMeanAnomalySun(t);
    
    var y = Math.tan(degToRad(epsilon)/2.0);
    y *= y;
    
    var sin2l0 = Math.sin(2.0 * degToRad(l0));
    var sinm   = Math.sin(degToRad(m));
    var cos2l0 = Math.cos(2.0 * degToRad(l0));
    var sin4l0 = Math.sin(4.0 * degToRad(l0));
    var sin2m  = Math.sin(2.0 * degToRad(m));
    
    var Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
    return radToDeg(Etime)*4.0;		// in minutes of time
}

function calcHourAngleSunrise(lat, solarDec) {
    var latRad = degToRad(lat);
    var sdRad  = degToRad(solarDec);
    var HAarg = (Math.cos(degToRad(90.833))/(Math.cos(latRad)*Math.cos(sdRad))-Math.tan(latRad) * Math.tan(sdRad));
    return Math.acos(HAarg);		// in radians (for sunset, use -HA)
}

function isNumber(inputVal) {
    var oneDecimal = false;
    var inputStr = "" + inputVal;
    for (var i = 0; i < inputStr.length; i++) {
        var oneChar = inputStr.charAt(i);
        if (i == 0 && (oneChar == "-" || oneChar == "+")) {
            continue;
        }
        if (oneChar == "." && !oneDecimal) {
            oneDecimal = true;
            continue;
        }
        if (oneChar < "0" || oneChar > "9") {
            return false;
        }
    }
    return true;
}


function zeroPad(n, digits) {
    n = n.toString();
    while (n.length < digits) {
        n = '0' + n;
    }
    return n;
}

function month(name, numdays, abbr) {
    this.name = name;
    this.numdays = numdays;
    this.abbr = abbr;
}

var monthList = new Array();
var i = 0;
monthList[i++] = new month("January", 31, "Jan");
monthList[i++] = new month("February", 28, "Feb");
monthList[i++] = new month("March", 31, "Mar");
monthList[i++] = new month("April", 30, "Apr");
monthList[i++] = new month("May", 31, "May");
monthList[i++] = new month("June", 30, "Jun");
monthList[i++] = new month("July", 31, "Jul");
monthList[i++] = new month("August", 31, "Aug");
monthList[i++] = new month("September", 30, "Sep");
monthList[i++] = new month("October", 31, "Oct");
monthList[i++] = new month("November", 30, "Nov");
monthList[i++] = new month("December", 31, "Dec");


function getJulianDay(dateTime) {
    var docmonth = dateTime.getMonth();
    var docday =   dateTime.getDay();
    var docyear =  dateTime.getYear();
    
    if ( (isLeapYear(docyear)) && (docmonth == 2) ) {
        if (docday > 29) {
            docday = 29
        } 
    } else {
        if (docday > monthList[docmonth-1].numdays) {
            docday = monthList[docmonth-1].numdays
        }
    }
    if (docmonth <= 2) {
        docyear -= 1
        docmonth += 12
    }
    var A = Math.floor(docyear/100)
    var B = 2 - A + Math.floor(A/4)
    return Math.floor(365.25*(docyear + 4716)) + Math.floor(30.6001*(docmonth+1)) + docday + B - 1524.5;
}

function getTimeLocal(dateTime) {
    var dochr = dateTime.getHour();
    var docmn = dateTime.getMinute();
    var docsc = dateTime.getSecond();
    return dochr * 60 + docmn + docsc/60.0;	    // in minutes
}

function calcSolNoon(julianDay, longitude, timezone, dst) {
    var tnoon = calcTimeJulianCent(julianDay - longitude/360.0)
    var eqTime = calcEquationOfTime(tnoon)
    var solNoonOffset = 720.0 - (longitude * 4) - eqTime // in minutes
    var newt = calcTimeJulianCent(julianDay + solNoonOffset/1440.0)
    eqTime = calcEquationOfTime(newt)
    var solNoonLocal = 720 - (longitude * 4) - eqTime + (timezone*60.0)// in minutes
    if(dst) solNoonLocal += 60.0
    while (solNoonLocal < 0.0) {
        solNoonLocal += 1440.0;
    }
    while (solNoonLocal >= 1440.0) {
        solNoonLocal -= 1440.0;
    }
    return timeDateString(julianDay, solNoonLocal);
}

function dayString(julianDay) {
    if ( (julianDay < 900000) || (julianDay > 2817000) ) {
        return;
    } else {
        var z = Math.floor(julianDay + 0.5);
        var f = (julianDay + 0.5) - z;
        if (z < 2299161) {
            var A = z;
        } else {
            var alpha = Math.floor((z - 1867216.25)/36524.25);
            var A = z + 1 + alpha - Math.floor(alpha/4);
        }
        var B = A + 1524;
        var C = Math.floor((B - 122.1)/365.25);
        var D = Math.floor(365.25 * C);
        var E = Math.floor((B - D)/30.6001);
        var day = B - D - Math.floor(30.6001 * E) + f;
        var month = (E < 14) ? E - 1 : E - 13;
        var year = ((month > 2) ? C - 4716 : C - 4715);
        
        return {
            year: year,
            month: month,
            day: day
        }
    }
}

function timeDateString(julianDay, minutes) {
    
    return {
        date: dayString(julianDay),
        time: timeString(minutes)
    }
}

function timeString(minutes) {
    if ( (minutes >= 0) && (minutes < 1440) ) {
        var floatHour = minutes / 60.0;
        var hour = Math.floor(floatHour);
        var floatMinute = 60.0 * (floatHour - Math.floor(floatHour));
        var minute = Math.floor(floatMinute);
        var floatSec = 60.0 * (floatMinute - Math.floor(floatMinute));
        var second = Math.floor(floatSec + 0.5);
        if (second > 59) {
            second = 0
            minute += 1
        }
        if (second >= 30) minute++;
        if (minute > 59) {
            minute = 0
            hour += 1
        }

        // ignore seconds
        return {
            hour: hour,
            minute: minute,
            second: 0
        }
    }
    
    return;
}

function calcSunriseSetUTC(rise, julianDay, latitude, longitude) {
    var t = calcTimeJulianCent(julianDay);
    var eqTime = calcEquationOfTime(t);
    var solarDec = calcSunDeclination(t);
    var hourAngle = calcHourAngleSunrise(latitude, solarDec);
    if (!rise) hourAngle = -hourAngle;
    var delta = longitude + radToDeg(hourAngle);
    return 720 - (4.0 * delta) - eqTime;    // in minutes
}

function calcSunriseSet(rise, julianDay, latitude, longitude, timezone, dst) {
    // rise = 1 for sunrise, 0 for sunset
    var id = ((rise) ? "risebox" : "setbox")
    var timeUTC = calcSunriseSetUTC(rise, julianDay, latitude, longitude);
    var newTimeUTC = calcSunriseSetUTC(rise, julianDay + timeUTC/1440.0, latitude, longitude); 
    
    if (isNumber(newTimeUTC)) {
        var timeLocal = newTimeUTC + (timezone * 60.0)
        
        // no needed?
        // timeLocal += ((dst) ? 60.0 : 0.0);
        if ( (timeLocal >= 0.0) && (timeLocal < 1440.0) ) {
            return timeDateString(julianDay, timeLocal)
        } else  {
            var jday = julianDay
            var increment = ((timeLocal < 0) ? 1 : -1)
            while ((timeLocal < 0.0)||(timeLocal >= 1440.0)) {
                timeLocal += increment * 1440.0
                jday -= increment
            }
            return timeDateString(jday, timeLocal)
        }
    } else { // no sunrise/set found
        var doy = calcDoyFromJD(julianDay)
        if ( ((latitude > 66.4) && (doy > 79) && (doy < 267)) ||
            ((latitude < -66.4) && ((doy < 83) || (doy > 263))) ) {
            
            //previous sunrise/next sunset
            var jdy;
            if (rise) { // find previous sunrise
                jdy = calcJDofNextPrevRiseSet(0, rise, julianDay, latitude, longitude, timezone, dst)
            } else { // find next sunset
                jdy = calcJDofNextPrevRiseSet(1, rise, julianDay, latitude, longitude, timezone, dst)
            }
            return dayString(jdy)
        } else {   //previous sunset/next sunrise
            var jdy;
            if (rise == 1) { // find previous sunrise
                jdy = calcJDofNextPrevRiseSet(1, rise, julianDay, latitude, longitude, timezone, dst)
            } else { // find next sunset
                jdy = calcJDofNextPrevRiseSet(0, rise, julianDay, latitude, longitude, timezone, dst)
            }
            return dayString(jdy)
        }
    }
}

function calcJDofNextPrevRiseSet(next, rise, julianDay, latitude, longitude, tz, dst) {
    var jDay = julianDay;
    var increment = ((next) ? 1.0 : -1.0);
    
    var time = calcSunriseSetUTC(rise, jDay, latitude, longitude);
    while(!isNumber(time)) {
        jDay += increment;
        time = calcSunriseSetUTC(rise, jDay, latitude, longitude);
    }
    var timeLocal = time + tz * 60.0 + ((dst) ? 60.0 : 0.0)
    while ((timeLocal < 0.0) || (timeLocal >= 1440.0)) {
        var incr = ((timeLocal < 0) ? 1 : -1)
        timeLocal += (incr * 1440.0)
        jDay -= incr
    }
    return jDay;
}


// function calcAzEl(output, T, localtime, latitude, longitude, zone) {
//     var eqTime = calcEquationOfTime(T)
//     var theta  = calcSunDeclination(T)
//     // if (output) {
//     //   document.getElementById("eqtbox").value = Math.floor(eqTime*100 +0.5)/100.0
//     //   document.getElementById("sdbox").value = Math.floor(theta*100+0.5)/100.0
//     // }
//     var solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone
//     var earthRadVec = calcSunRadVector(T)
//     var trueSolarTime = localtime + solarTimeFix
//     while (trueSolarTime > 1440) {
//         trueSolarTime -= 1440
//     }
//     var hourAngle = trueSolarTime / 4.0 - 180.0;
//     if (hourAngle < -180) {
//         hourAngle += 360.0
//     }
//     var haRad = degToRad(hourAngle)
//     var csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad)
//     if (csz > 1.0)  {
//         csz = 1.0
//     } else if (csz < -1.0) { 
//         csz = -1.0
//     }
//     var zenith = radToDeg(Math.acos(csz))
//     var azDenom = ( Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith)) )
//     if (Math.abs(azDenom) > 0.001) {
//         azRad = (( Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith)) ) - Math.sin(degToRad(theta))) / azDenom
//         if (Math.abs(azRad) > 1.0) {
//             if (azRad < 0) {
//                 azRad = -1.0
//             } else {
//                 azRad = 1.0
//             }
//         }
//         var azimuth = 180.0 - radToDeg(Math.acos(azRad))
//         if (hourAngle > 0.0) {
//             azimuth = -azimuth
//         }
//     } else {
//         if (latitude > 0.0) {
//             azimuth = 180.0
//         } else { 
//             azimuth = 0.0
//         }
//     }
//     if (azimuth < 0.0) {
//         azimuth += 360.0
//     }
//     var exoatmElevation = 90.0 - zenith
//     
//     // Atmospheric Refraction correction
//     
//     if (exoatmElevation > 85.0) {
//         var refractionCorrection = 0.0;
//     } else {
//         var te = Math.tan (degToRad(exoatmElevation));
//         if (exoatmElevation > 5.0) {
//             var refractionCorrection = 58.1 / te - 0.07 / (te*te*te) + 0.000086 / (te*te*te*te*te);
//         } else if (exoatmElevation > -0.575) {
//             var refractionCorrection = 1735.0 + exoatmElevation * (-518.2 + exoatmElevation * (103.4 + exoatmElevation * (-12.79 + exoatmElevation * 0.711) ) );
//         } else {
//             var refractionCorrection = -20.774 / te;
//         }
//         refractionCorrection = refractionCorrection / 3600.0;
//     }
//     
//     var solarZen = zenith - refractionCorrection;
//     
//     // if ((output) && (solarZen > 108.0) ) {
//     //   document.getElementById("azbox").value = "dark"
//     //   document.getElementById("elbox").value = "dark"
//     // } else if (output) {
//     //   document.getElementById("azbox").value = Math.floor(azimuth*100 +0.5)/100.0
//     //   document.getElementById("elbox").value = Math.floor((90.0-solarZen)*100+0.5)/100.0
//     //   if (document.getElementById("showae").checked) {
//     //     showLineGeodesic("#ffff00", azimuth)
//     //   }
//     // }
//     return (azimuth)
// }

exports.calculateSolarTimes = calculateSolarTimes;