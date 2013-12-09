var db = require('./database'),
    utils = require('./utils'),
    errors = require('./errors').User,
    async = require('async'),
    bcrypt = require('bcrypt'),
    sanitizer = require('sanitizer'),
    QueryStrings = require('./queryStrings'),
    Message = require('./clientMessage'),
    config = require('../config'),
    mandrill = require('mandrill-api/mandrill'),
    mailer = new mandrill.Mandrill(config.mandrillParams.key);

var user = {
    LoginWithEmail: function(email, password, callback) {
        var clean_email = sanitizer.sanitize(email);
        var get = { email: clean_email };
        var locals = {};
        async.waterfall([
            db.GetConnection.bind(db),
            function(connection, cb) {
                locals.connection = connection;
                locals.connection.query(QueryStrings.User.VERIFY_LOGIN, get, cb);
            },
            function(rows, fields, cb) {
                if(rows == null || rows[0] == null) {
                    var message = new Message(errors.NO_EMAIL);
                    // Set error to true so we skip to the bottom
                    cb(true, false, message);
                }
                else if(rows[0].emailConfirmed < 1) {
                    var message = new Message(errors.NOT_CONFIRMED);
                    cb(true, false, message);
                }
                else {
                    locals.dbuser = rows[0];
                    var pw_hash = rows[0].password;
                    bcrypt.compare(password, pw_hash, cb);
                }
            },
            function(canLogin, cb) {
                if(!canLogin) {
                    cb(null, false, new Message(errors.BAD_PASSWORD));
                }
                else {
                    var user = { id: locals.dbuser.id, email: locals.dbuser.email, nickname: locals.dbuser.nickname };
                    cb(null, user);
                }
            }
        ], function(err, user, message) {
            console.log("Error: ", err);
            console.log("Result: ", user);
            // I guess this is kinda hacky. Might want to enforce a stricter interface for sending user error messages
            // If we have a message, let's go ahead and set error to null
            if(message) err = null;
            db.EndConnection(err, user, locals.connection, function(err, result) {
                callback(err, user, message);
            });
        });
    },
    VerifyEmailToken: function(userid, token, callback) {
        var checkConfirmed = QueryStrings.User.CHECK_EMAIL_CONFIRMED;
        var queryString = QueryStrings.User.VERIFY_REGISTRATION_TOKEN;
        if(!userid) {
            return callback(new Message("No user set"));
        }
        else if(!token) {
            return callback(new Message("No token given"));
        }
        else if(!queryString) {
            return callback(new Message("No query given"));
        }

        var queryParams = { id: userid };
        var locals = {};
        async.waterfall([
            // First grab a connection
            db.GetConnection.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                locals.connection.query(checkConfirmed, queryParams, callback);
            },
            // Now check if the email has already been confirmed
            function(rows, fields, callback) {
                if(rows == null || rows[0] == null) {
                    callback(new Message(errors.NO_ID));
                }
                else if(rows[0].EmailConfirmed) {
                    callback(new Message(errors.ALREADY_CONFIRMED));
                }
                else {
                    locals.connection.query(queryString, queryParams, callback);
                }
            },
            // Now compare the tokens
            function(rows, fields, callback) {
                if(rows == null || rows[0] == null) {
                    callback (new Message(errors.NO_ID));
                }
                else {
                    var found_hash = rows[0].emailToken;
                    var clean_token = sanitizer.sanitize(token);
                    bcrypt.compare(clean_token, found_hash, callback);
                }
            },
            // Finally, make sure to reflect verification in the database
            function(tokenMatches, callback) {
                if(!tokenMatches) {
                    callback(new Message(errors.INCORRECT_TOKEN));
                }
                else {
                    var queryString = QueryStrings.User.SET_REGISTRATION_VERIFIED;
                    var args = [{emailConfirmed: 1}, {id: userid }];
                    locals.connection.query(queryString, args, callback);
                }
            },
            function(results, cb) {
                if(!results || !results.affectedRows) {
                    callback(new Message(errors.EXPIRED_TOKEN), false);
                }
                else {
                    callback(null, true);
                }
            }
        ], function(err, rows, fields) {
            db.EndConnection(err, rows, locals.connection, callback);
        });
    },
    RegisterEmail: function(name, email, password, latitude, longitude, callback) {
        var clean_email = sanitizer.sanitize(email);
        var clean_name = sanitizer.sanitize(name);
        var clean_latitude = sanitizer.sanitize(latitude);
        var clean_longitude = sanitizer.sanitize(longitude);
        var locals = {};
        async.waterfall([
            db.GetConnection.bind(db),
            function(connection, cb) {
                locals.connection = connection;
                cb(null, password);
            },
            // Get a password hash
            db.GenerateHash.bind(db),
            function(hash, cb) {
                locals.hash = hash;
                cb(null);
            },
            // Next, generate a unique token
            db.GenerateToken.bind(db),
            function(token, cb) {
                var tokenString = token;
                locals.clean_token = sanitizer.sanitize(tokenString);
                cb(null, locals.clean_token);
            },
            // Then create a hash of this token
            db.GenerateHash.bind(db),
            // Now attempt to insert into the database
            function(token_hash, cb) {
                var post = {email: clean_email, nickname: clean_name, password: locals.hash, emailToken: token_hash, latitude: clean_latitude, longitude: clean_longitude};
                locals.connection.query(QueryStrings.User.REGISTRATION, post, cb);
            }
        ], function(err, row, fields) {
            var user = null;
            if(row) {
                user = {
                    email: clean_email,
                    name: clean_name,
                    id: row.insertId,
                    token: locals.clean_token
                };
            }
            db.EndConnection(err, user, locals.connection, callback);
        });
    },
    CheckEmailTaken: function(email, callback) {
        var clean_email = sanitizer.sanitize(email);
        var post = {email: clean_email};
        var locals = {};
        async.waterfall([
            db.GetConnection.bind(db),
            function(connection, cb) {
                locals.connection = connection;
                locals.connection.query(QueryStrings.User.CHECK_EXISTING_EMAIL, post, cb);
            },
            function(rows, fields, cb) {
                console.log(rows);
                // User does exist
                if(rows[0] && rows[0].email) {
                    cb(null, true);
                }
                // User does not exist
                else {
                    cb(null, false);
                }
            }
        ], function(err, results) {
            db.EndConnection(err, results, locals.connection, callback);
        });
    },
    SendRegistrationEmail: function(user, callback) {
        var opts = config.mandrillParams;

        // A simple string with a url link
        var emailStr = "Click the below link to confirm your registration:<br/>"+
            config.url.full+"/user/"+user.id+"/confirmemail/"+user.token;

        // Formatting the message for mandrill
        var message = {
            from_email: opts.from_email,
            from_name: opts.from_name,
            html: emailStr,
            subject: "Spot.Me Registration Confirmation",
            to: [{
                email: user.email,
                name: user.nickname,
                type: "to"
            }]
        };

        // As per the API docs here: https://mandrillapp.com/api/docs/users.nodejs.html
        mailer.messages.send({message: message, async: true, ip_pool: "Main Pool" },
            function(result) {
                console.log(result);
            },
            // This extra callback is weird/unconventional. No me gusta
            function(e) {
                console.log("Error occurred sending email:", e.name, '-', e.message);
            });
        callback(null);
    },
    get: function(userid, query, callback) {
        var param = {id: userid};

        async.waterfall([
            async.apply(utils.cleanInputs, param),
            function(clean_params, cb) {
                db.Query(query, clean_params, cb);
            }
        ], function(err, results){
            console.log(results);
            if(!results || !results[0]) {
                callback(new Message(errors.NO_ID), null);
            }
            else {
                callback(err, results);
            }
        });
    }
};

module.exports = user;
