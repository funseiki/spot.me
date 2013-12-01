var config = require('../config').db,
    bcryptParams = require('../config').bcryptParams,
    mysql = require('mysql'),
    async = require('async'),
    bcrypt = require('bcrypt'),
    sanitizer = require('sanitizer'),
    crypto = require('crypto'),
    errors = require('./errors');

var database = {
    pool: mysql.createPool({
        host                       : config.host
    ,   port                       : config.port
    ,   supportBigNumbers          : true
    ,   database                   : config.database
    ,   user                       : config.user
    ,   password                   : config.password
    ,   waitForConnections         : config.waitForConnections
    ,   connectionLimit            : config.connectionLimit
    }),
    EndConnection: function(err, results, connection, callback) {
        if(connection) connection.release();
        callback(err, results);
    },
    GetConnection: function(callback) {
        this.pool.getConnection(callback);
    },
    GenerateHash: function(input, callback) {
        bcrypt.genSalt(bcryptParams.workFactor, function(err, salt)
        {
            if(err)
            {
                callback(err, null);
                return;
            }
            bcrypt.hash(input, salt, function(err, hash)
            {
                if(err)
                {
                    callback(err, null);
                    return;
                }
                else
                {
                    return callback(null, hash);
                }
            });
        });
    },
    GenerateToken: function(callback) {
        crypto.randomBytes(48, function(ex, buf)
        {
            if(ex)
            {
                return callback(ex);
            }
            else
            {
                var token = buf.toString('hex');
                var clean_token = sanitizer.sanitize(token);
                callback(null, clean_token);
            }
        });
    },
    Query: function(queryString, inputs, callback) {
        var locals = {};
        async.waterfall([
            // Grab a connection from the pool
            this.GetConnection.bind(this),
            // Do the query
            function(connection, cb) {
                locals.connection = connection;
                locals.connection.query(queryString, inputs, cb);
            }
        // Return connection to the pool and callback the results
        ], function(err, results) {
            this.EndConnection(err, results, locals.connection, callback);
        }.bind(this));
    }
};

module.exports = database;
