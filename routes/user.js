/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async');

function userRoute(app, User) {
    app.get('/user/:id/confirmemail/:token', function(req, res) {
        var userid = req.params.id,
            token = req.params.token;
        console.log("userid: " + userid);
        console.log("token: " + token);
        User.VerifyEmailToken(userid, token, function(err, result)
        {
            if(err) {
                console.log(err);
                res.send("Incorrect token");
            }
            else if(!result) {
                res.send("The token has expired");
            }
            else {
                res.send("Registration confirmed!");
            }
        });
    });

    app.post('/user/register/email', function(req, res)
    {
        var email = req.body.email,
            password = req.body.password,
            name = req.body.name;

        var errors = [];
        // Check for blank fields
        errors = errors.concat(check(email).notNull().notEmpty().getErrors());
        errors = errors.concat(check(password).notNull().notEmpty().getErrors());
        errors = errors.concat(check(name).notNull().notEmpty().getErrors());
        if(errors.length > 0) {
            res.send("A field has been left blank");
            return;
        }

        // Make sure the email string is properly formed
        if(check(email).isEmail().hasError()) {
            res.send("Invalid Email");
            return;
        }

        var locals = {response: "There was a database issue :/"};
        async.waterfall([
            // Make sure the email isn't taken already
            async.apply(User.CheckEmailTaken.bind(User), email),
            function(isTaken, callback) {
                locals.response = "That email already exists!";
                callback(null, name, email, password);
            },
            // If it isn't, let's register
            User.RegisterEmail.bind(User),
            function(new_user, callback) {
                // TODO: Send a registration email here
                locals.response = "Success, check your email to confirm your registration!";
                console.log(new_user);
                callback(null);
            }
        ], function(err){
            res.send(locals.response);
        });
    });
}

module.exports = userRoute;
