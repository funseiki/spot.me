// File containing error strings
var User = {
    NO_ID: "No user with that id exists",
    NO_EMAIL: "No user with that email exists",
    NOT_CONFIRMED: "Please check your email to confirm registration",
    BAD_PASSWORD: "Incorrect password",
    ALREADY_CONFIRMED: "This user has already confirmed",
    INCORRECT_TOKEN: "Incorrect Token",
    EXPIRED_TOKEN: "The token has expired"
};

var Spot = {

};

var Database = {
    GENERIC: "Unable to access information at this time"
};

var Errors = {
    User: User,
    Database: Database,
    Spot: Spot,
    Log: function(message) {
        // Log more betterer
        console.log(message);
    }
};

module.exports = Errors;
