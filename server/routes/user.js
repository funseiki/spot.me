/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    allowRequest = require('./checkUser'),
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
            name = req.body.name,
            latitude = req.body.latitude,
            longitude = req.body.longitude;

        var errors = [];
        // Check for blank fields
        errors = errors.concat(check(email).notNull().notEmpty().getErrors());
        errors = errors.concat(check(password).notNull().notEmpty().getErrors());
        errors = errors.concat(check(name).notNull().notEmpty().getErrors());
        errors = errors.concat(check(latitude).notNull().notEmpty().getErrors());
        errors = errors.concat(check(longitude).notNull().notEmpty().getErrors());
        if(errors.length > 0) {
            res.json({
                success: true,
                message: "A field has been left blank"
            });
            return;
        }

        // Make sure the email string is properly formed
        if(check(email).isEmail().hasError()) {
            res.statusCode = 403;
            res.json({
                success: true,
                message: "Invalid Email"
            });
            return;
        }
        if(check(latitude).isFloat().hasError() || check(latitude).isFloat().hasError()) {
            res.statusCode = 403;
            res.json({
                success: false,
                message: "Invalid Location"
            });
            return;
        }

        var locals = {
            success: false,
            message: "There was a database issue :/"
        };
        async.waterfall([
            // Make sure the email isn't taken already
            async.apply(User.CheckEmailTaken.bind(User), email),
            function(isTaken, callback) {
                locals.message = "That email already exists!";
                callback(null, name, email, password, latitude, longitude);
            },
            // If it isn't, let's register
            User.RegisterEmail.bind(User),
            function(new_user, callback) {
                // TODO: Send a registration email here
                locals.response = {
                    success: true,
                    message: "Success, check your email in a bit to confirm your registration!"
                };
                User.SendRegistrationEmail(new_user, callback);
            }
        ], function(err){
            res.json(locals.response);
        });
    });

    app.post('/user/profile', allowRequest, function(req, res){
        var userid = req.user.id;
        User.GetProfile(userid, function(err, result) {
            if(err) {
                res.statusCode =500;
                res.json({
                    success: false,
                    message: "Unable to get profile"
                });
                return;
            }
            res.json({
                success: true,
                results: result
            });
        })
    });
}

module.exports = userRoute;
