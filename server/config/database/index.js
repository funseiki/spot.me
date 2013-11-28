// Standalone script to configure the database
var schema = require('./postgres'),
    config = require('..').db,
    mysql = require('mysql'),
    async = require('async');

// The below is for usage with node-anydb. We'll just be using node-mysql
/**
 *var db_url = config.adapter.concat("://").
 *           concat(config.user).concat(":").
 *          concat(config.password).concat("@").
 *          concat(config.host).concat(":").
 *          concat(config.port).concat("/").
 *          concat(config.database);
 **/

var pool = mysql.createPool({
    host                       : config.host
,   port                       : config.port
,   supportBigNumbers          : true
,   database                   : config.database
,   user                       : config.user
,   password                   : config.password
,   waitForConnections         : config.waitForConnections
,   connectionLimit            : config.connectionLimit
});

var locals = {};
async.waterfall([
    pool.getConnection.bind(pool),
    function(connection, cb) {
        locals.connection = connection;
        var query = "describe users";
        locals.connection.query(query, [], cb);
    },
], function(err, results){
    console.log("Error?: ", err);
    console.log("Result: ", results);
    locals.connection.release();
});
