// Here is where the config for modules should happen

function validatorConfig() {
    // Validator config.
    var Validator = require('validator').Validator;
    Validator.prototype.error = function(msg) {
        // Instead of throwing an error, collect them
        this._errors.push(msg);
        return this;
    }

    // Return all the errors since the last call
    Validator.prototype.getErrors = function() {
        var ret = this._errors;
        this._errors = []; // clear the current array of errors
        return ret;
    }

    // Returns a boolean instead of a list
    Validator.prototype.hasError = function() {
        var old = this._errors;
        this._errors = [];
        return old.length > 0;
    }

    // Clear errors
    Validator.prototype.clearErrors = function() {
        this._errors = [];
        return this;
    }
}

function configModules() {
    validatorConfig();
}

module.exports = configModules;

