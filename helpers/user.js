var db = require('./database'),
    utils = require('./utils'),
    errors = require('./errors').User,
    async = require('async'),
    bcrypt = require('bcrypt');

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
                    cb(new Error(errors.NO_EMAIL), false);
                }
                else if(rows[0].EmailConfirmed < 1) {
                    cb(new Error(errors.NOT_CONFIRMED), false);
                }
                else {
                    locals.dbuser = rows[0];
                    var pw_hash = rows[0].password;
                    bcrypt.compare(password, pw_hash, cb);
                }
            },
            function(canLogin, cb) {
                if(!canLogin) {
                    cb(new Error(errors.BAD_PASSWORD), canLogin);
                }
                else {
                    var user = { id: locals.dbuser.id, email: locals.dbuser.email, name: locals.dbuser.name };
                    cb(null, user);
                }
            }
        ], function(err, rows) {
            db.CleanPool(err, rows, locals.connection, callback);
        });
    },
    VerifyEmailToken: function(userid, token, callback) {
        var checkConfirmed = QueryStrings.User.CHECK_EMAIL_CONFIRMED;
        var queryString = QueryStrings.User.VERIFY_REGISTRATION_TOKEN;
        if(!userid) {
            return callback(new Error("No user set"));
        }
        else if(!token) {
            return callback(new Error("No token given"));
        }
        else if(!queryString) {
            return callback(new Error("No query given"));
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
                    callback(new Error(errors.NO_ID));
                }
                else if(rows[0].EmailConfirmed) {
                    callback(new Error(errors.ALREADY_CONFIRMED));
                }
                else {
                    locals.connection.query(queryString, queryParams, callback);
                }
            },
            // Now compare the tokens
            function(rows, fields, callback) {
                if(rows == null || rows[0] == null) {
                    callback (new Error(errors.NO_ID));
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
                    callback(new Error(errors.INCORRECT_TOKEN));
                }
                else {
                    var queryString = QueryStrings.User.SET_REGISTRATION_VERIFIED;
                    var args = [{emailConfirmed: 1}, {id: userid }];
                    locals.connection.query(queryString, args, cb);
                }
            },
            function(results, cb) {
                if(!results || !results.affectedRows) {
                    callback(new Error(errrors.EXPIRED_TOKEN), false);
                }
                else {
                    callback(null, true);
                }
            }
        ], function(err, rows, fields) {
            db.CleanPool(err, rows, locals.connection, callback);
        });
    },
    RegisterEmail: function(name, email, password, callback) {
        var clean_email = sanitizer.sanitize(email);
        var clean_name = sanitizer.sanitize(name);
        var locals = {};
        async.waterfall([
            db.getConnection.bind(db),
            function(connection, cb) {
                locals.connection = connection;
                cb(null, password);
            },
            // Get a password hash
            this.GenerateHash,
            function(hash, cb) {
                locals.hash = hash;
                cb(null);
            },
            // Next, generate a unique token
            this.GenerateToken,
            function(token, cb) {
                var tokenString = token;
                locals.clean_token = sanitizer.sanitize(tokenString);
                cb(null, locals.clean_token);
            },
            // Then create a hash of this token
            this.GenerateHash,
            // Now attempt to insert into the database
            function(token_hash, cb) {
                var post = {email: clean_email, nickname: clean_name, password: locals.hash, emailToken: token_hash};
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
            this.CleanPool(err, user, locals.connection, callback);
        }.bind(this));
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
                callback(new Error(errors.NO_ID), null);
            }
            else {
                callback(err, results);
            }
        });
    }
};

module.exports = user;
