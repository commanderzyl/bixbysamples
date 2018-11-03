exports.tests = []
exports.preconditions = []

var ACCESSORIES = require("./lib/accessories");

//FindAccessories
exports.function = function(shoe) {
    //assume this requires an expensive call :)
    //but we'll actually just fake it by assuming any accessory has a 50% chance of being available for a shoe!
    var result = []
    ACCESSORIES.forEach(function(accessory){
        if (Math.random() > 0.5) {
            result.push(accessory)
        }
    })
    return result
}