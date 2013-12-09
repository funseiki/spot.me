// File containing error strings
var User = {
    NO_ID: "No user with that id exists",
    NO_EMAIL: "No user with that email exists",
    NOT_CONFIRMED: "Please check your email to confirm registration",
    BAD_PASSWORD: "Incorrect password",
    ALREADY_CONFIRMED: "This user has already confirmed",
    INCORRECT_TOKEN: "Incorrect Token",
    EXPIRED_TOKEN: "The token has expired",
    UNABLE_TO_VERIFY: "Unable to verify this spot. " +
                    " You might have already found it"
};

var Spot = {
    NO_ID: "No spot with that id exists",
    INVALID_SPOT: "This is not the spot",
};

var List = {
    CANNOT_CREATE: "Unable to create list with those parameters"
};

var Database = {
    GENERIC: "Unable to access information at this time"
};

var General = {
    MISSING_INPUTS: "Inputs missing"
}

var Errors = {
    User: User,
    Database: Database,
    Spot: Spot,
    General: General,
    List: List,
    Log: function(message) {
        // Log more betterer
        console.log(message);
    }
};

module.exports = Errors;
