var sanitizer = require('sanitizer'),
    check = require('validator').check,
    async = require('async');

var Utils = {
    // Utility Functions
    /*  cleanInputs
     *      inputs: Takes a dictionary of inputs
     *          Note that undefined values will be given string values. E.g. null becomes "null"
     *      callback: Calls back with a dictionary of sanitized outputs
     */
    cleanInputs: function(inputs, callback) {
        var clean_out = {};
        var keys = Object.keys(inputs);
        async.map(keys, function(key, cb) {
            var clean_item = sanitizer.sanitize(inputs[key]);
            cb(null, clean_item);
        }, function(err, clean_params) {
            var i = 0;
            async.each(keys, function(key, cb){
                clean_out[key] = clean_params[i];
                i++;
                cb();
            }, function(err){
                callback(err, clean_out);
            });
        });
    },
    /*  inputsMissing
     *      requiredArray: Array of all the parameters that should exist
     *      inputMap: Dictionary of items
     *      callback(missingInputs)
     */
    inputsMissing: function(requiredArray, inputMap, callback) {
        async.filter(requiredArray, function(item, cb) {
            cb(check(inputMap[item]).notNull().notEmpty().hasError());
        }, function(results){
            callback(results);
        });
    },
    // Same as above except returns a list of the items that exist in the map
    inputsExist: function(requiredArray, inputMap, callback) {
        async.remove(requiredArray, function(item, cb) {
            cb(check(inputMap[item]).notNull().notEmpty().hasError());
        }, function(results){
            callback(results);
        });
    },
    // Prune's the input function so that the keys are a subset of requiredKeys
    // Note: This is not a strict prune. The number of keys can be less than requiredKeys (but not more)
    pruneSome: function(requiredKeys, inputCollection, callback) {
        var newCollection = {};
        async.each(requiredKeys, function(key, cb) {
            if(!check(inputCollection[key]).notNull().notEmpty().hasError()) {
                newCollection[key] = inputCollection[key];
            }
            cb();
        }, function(err) {
            callback(newCollection);
        });
    }
}

module.exports = Utils;
