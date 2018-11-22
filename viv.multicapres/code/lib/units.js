/* global require, six5, units */
/*
 * Unit Conversion Utility
 * Convert measurements to new units.
 *
 * There is a simple utility which can be used to convert units.
 * The `fromUnit` and `toUnit` are strings such as
 * "CubicCentimeter", "Milligram" or "Fahrenheit".
 */

// TODO There are probably better ways of doing this, but it was quick and simple.
//
// Author: Andrew Roberts

/*
 * Utility class for unit conversion.
 */
var UnitConverter = function() {

    "use strict";

    this.temperatureUnitMap = createTemperatureUnitMap();
}

UnitConverter.prototype = {
    /**
     * Convert an amount from one mapped unit type to another.
     * @param amount {Number}
     * @param fromUnit {String} The input unit type.
     * @param toUnit {String} The output unit type.
     * @param unitMap {Object}
     * @returns {Number} The converted amount.
     */
    convert: function(amount, fromUnit, toUnit, unitMap) {
        if (amount === undefined) {
           amount = 1.0;
        }
        if(fromUnit === toUnit) {
            return amount;
        }

        return unitMap[fromUnit][toUnit] * amount;
    },
    /**
     * Convert a temperature from one unit type to another.
     * @param amount {Number}
     * @param fromUnit {String} The input unit type.
     * @param toUnit {String} The output unit type.
     * @returns {Number} The converted amount.
     */
    convertTemperature: function(amount, fromUnit, toUnit) {
        return this.temperatureUnitMap[fromUnit][toUnit](amount);
    }
};

/**
 * Construct a new UnitConverter.
 * @returns {UnitConverter}
 */
UnitConverter.get = function() {
    // TODO make this a singleton?
    return new UnitConverter();
}

function createTemperatureUnitMap() {
    return {
        Celsius: {
            Celsius: function(value) {
                return value;
            },
            Fahrenheit: function(value) {
                return ((value * 9/5) + 32).toFixed(1);
            },
            Kelvin: function(value) {
                return (value + 273.15).toFixed(1);
            }
        },
        Fahrenheit: {
            Celsius: function(value) {
                return ((value - 32) * 5/9).toFixed(1);
            },
            Fahrenheit: function(value) {
                return value;
            },
            Kelvin: function(value) {
                return ((value + 459.67) * 5/9).toFixed(1);
            }
        },
        Kelvin: {
            Celsius: function(value) {
                return (value - 273.15).toFixed(1);
            },
            Fahrenheit: function(value) {
                return ((value * 9/5) - 459.67).toFixed(1);
            },
            Kelvin: function(value) {
                return value;
            }
        }
    }
}

Object.freeze(UnitConverter);
exports.UnitConverter = UnitConverter;

// units.js
