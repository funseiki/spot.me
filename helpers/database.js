var config = require('../config').db,
    mysql = require('mysql'),
    async = require('async');

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
    cleanPool: function(err, results, connection, callback) {
        if(connection) connection.release();
        callback(err, results);
    },
    Query: function(queryString, inputs, callback) {
        var locals = {};
        async.waterfall([
            // Grab a connection from the pool
            this.pool.getConnection.bind(this.pool),
            // Do the query
            function(connection, cb) {
                locals.connection = connection;
                locals.connection.query(queryString, inputs, cb);
            }
        // Return connection to the pool and callback the results
        ], function(err, results) {
            this.cleanPool(err, results, locals.connection, callback);
        }.bind(this));
    }
};

module.exports = database;
