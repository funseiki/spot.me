var async = require('async'),
    valid = require('validator').sanitize,
    path = require('path'),
    db = require('./database'),
    utils = require('./utils'),
    errors = require('./errors'),
    QueryStrings = require('./queryStrings'),
    Message = require('./clientMessage'),
    config = require('../config'),
    geo = require('./geoUtils');

var list = {
    createFromRandom: function(params, main_callback) {
        var locals ={},
            self = this;
        async.waterfall([
            function(callback) {
                if(params.connection) {
                    callback(null, params.connection);
                }
                else {
                    db.StartTransaction(callback);
                }
            },
            function(connection, callback) {
                locals.connection = connection;
                var inputs= {ownerid: params.ownerid, title: params.title, latitude: params.latitude, longitude: params.longitude};
                utils.cleanAndPrune(['ownerid', 'title', 'latitude', 'longitude'], inputs, callback);
            },
            function(clean_inputs, callback) {
                locals.clean_inputs = clean_inputs;
                // Create the list
                self.create({ownerid: clean_inputs.ownerid, title: clean_inputs.title, connection: locals.connection}, callback);
            },
            function(result, callback) {
                var latRange = 1000,
                    longRange = 1000;
                locals.clean_inputs.latitude = valid(locals.clean_inputs.latitude).toFloat();
                locals.clean_inputs.longitude = valid(locals.clean_inputs.longitude).toFloat();

                var id = locals.clean_inputs.ownerid,
                    latMin = locals.clean_inputs.latitude - latRange,
                    latMax = locals.clean_inputs.latitude + latRange,
                    longMin = locals.clean_inputs.longitude - longRange,
                    longMax = locals.clean_inputs.longitude + longRange;

                locals.connection.query(QueryStrings.List.INSERT_RANDOM,
                    [result.listid, id, id, latMin, latMax, longMin, longMax], function(err, rows, fields) {
                        if(err) {
                            console.log("Error in spot insertion: ", err);
                            callback(true, {
                                success: false,
                                message: errors.List.CANNOT_CREATE
                            });
                        }
                        else {
                            callback(null, {
                                success: true,
                                message: "Successfully created list",
                                listid: result.listid
                            });
                        }
                    });
            }
        ], function(err, results){
            if(params.connection) {
                main_callback(err, results);
            }
            else {
                db.EndTransaction(err, results, locals.connection, main_callback);
            }
        });
    },
    getCurrent: function(userid, main_callback) {
        var locals = {};
        var self = this;
        async.waterfall([
            db.GetConnection.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                utils.cleanAndPrune(['userid'], {userid: userid}, callback);
            },
            function(clean_user, callback) {
                locals.connection.query(QueryStrings.List.GET_CURRENT, clean_user.userid, callback);
            }
        ], function(err, result) {
            db.EndConnection(err, result, locals.connection, main_callback);
        });
    },
    setCurrent: function(params, main_callback) {

    },
    create: function(params,  main_callback) {
        var locals ={};
        async.waterfall([
            function(callback) {
                if(params.connection) {
                    callback(null, params.connection);
                }
                else {
                    db.GetConnection(callback);
                }
            },
            function(connection, callback) {
                locals.connection = connection;
                var get = {ownerid: params.ownerid, title: params.title, isCurrent: 1};
                utils.cleanAndPrune(['ownerid', 'title', 'isCurrent'], get, callback);
            },
            function(clean_inputs, callback) {
                locals.connection.query(QueryStrings.List.CREATE, clean_inputs, function(err, rows, fields){
                    if(err) {
                        callback(true, {
                            success: false,
                            message: errors.List.CANNOT_CREATE
                        });
                    }
                    else {
                        callback(null, {
                            success: true,
                            listid: rows.insertId
                        });
                    }
                });
            }
        ], function(err, results){
            if(params.connection) {
                main_callback(err, results);
            }
            else {
                db.EndConnection(err, results, locals.connection, main_callback);
            }
        });
    }
};

module.exports = list;

