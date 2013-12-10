var db = require('./database'),
    utils = require('./utils'),
    errors = require('./errors'),
    async = require('async'),
    bcrypt = require('bcrypt'),
    sanitizer = require('sanitizer'),
    valid = require('validator').sanitize,
    QueryStrings = require('./queryStrings'),
    Message = require('./clientMessage'),
    config = require('../config'),
    knox = require('knox'),
    AWS = require('aws-sdk'),
    path = require('path'),
    s3 = require('aws2js').load('s3', config.aws.keys.accessKeyId, config.aws.keys.secretAccessKey);
    s3.setBucket(config.aws.bucket),
    geo = require('./geoUtils');

var spot = {
    makeImage: function(imageData, s3Folder, main_callback) {
        var locals = {};
        async.waterfall([
            function(callback) {
                utils.inputsMissing(['imageName', 'imagePath'], imageData, function(missing){
                    var err = null;
                    if(missing > 0) {
                        callback(true, new Message(errors.General.INPUTS_MISSING, missing));
                    }
                    else {
                        callback(null);
                    }
                });
            },
            function(callback) {
                utils.pruneSome(['imageName', 'imagePath'], imageData, function(newCollection){
                    utils.cleanInputs(imageData, callback);
                });
            },
            function(clean_image, callback) {
                locals.clean_image= clean_image;
                callback(null);
            },
            async.apply(db.GenerateToken),
            function(token, callback) {
                locals.url = '/'+ s3Folder+'/' + token + path.extname(locals.clean_image.imageName);
                s3.putFile(locals.url, locals.clean_image.imagePath, 'public-read' , {}, callback);
            }
        ], function(err, res){
            if(err) console.log("makeImage::Err", err);
            main_callback(err, "https://s3.amazonaws.com/" +config.aws.bucket + locals.url);
        });
    },
    verifySpot: function(userid, spotinfo, main_callback) {
        var locals = {};
        async.waterfall([
            db.StartTransaction.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                var get = spotinfo;
                get.userid = userid;
                utils.cleanAndPrune(['userid','latitude', 'longitude', 'spotid'], get, callback);
            },
            function(clean_inputs, callback) {
                locals.clean_inputs = clean_inputs;
                locals.connection.query(QueryStrings.Spot.GET_LOCATION, {id: clean_inputs.spotid}, callback);
            },
            function(rows, fields, callback) {
                if(!rows || !rows[0]) {
                    callback(true, new Message(errors.Spot.NO_ID));
                    return;
                }
                var spotPoint = geo.Point(rows[0].latitude, rows[0].longitude);
                var myPoint = geo.Point(locals.clean_inputs.latitude, locals.clean_inputs.longitude);
                // Get distance between points in meters
                var distance = geo.Distance(spotPoint, myPoint) * 1000;
                var retMessage = null;
                if(distance > 10) {
                    retMessage = {
                        success: false,
                        message: errors.Spot.INVALID_SPOT,
                        distance: distance
                    };
                    callback(true, retMessage);
                    return;
                }
                else {
                    callback();
                }
            },
            function(callback) {
                var post = {spotid: locals.clean_inputs.spotid, userid: locals.clean_inputs.userid};
                locals.connection.query(QueryStrings.User.SPOT_VERIFIED, post, function(err, row, fields){
                    if( err || row.affectedRows < 1 ) {
                        callback(true, {
                            success: false,
                            message: errors.User.UNABLE_TO_VERIFY
                        });
                        return;
                    }
                    locals.connection.query(QueryStrings.Spot.GET_SPOT_DATA, {id: locals.clean_inputs.spotid}, callback);
                });
            },
            function(rows, fields, callback) {
                if(!rows || !rows[0]) {
                    callback(true, {
                        success: false,
                        message: "Unable to obtain spot data"
                    });
                    return;
                }
                callback(null, {
                    success: true,
                    results: rows[0]
                });
            }
        ], function(err, result) {
            db.EndTransaction(err, result, locals.connection, main_callback);
        });
    },
    getSpotData: function(params, main_callback) {

    },
    getAvailableSpots: function(userid, location, main_callback) {
        var locals = {};
        var latRange = 200,
            longRange = 200;
        async.waterfall([
            db.StartTransaction.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                var get = location;
                get.userid = userid;
                utils.cleanAndPrune(['userid', 'latitude', 'longitude'], get, callback);
            },
            function(clean_inputs, callback) {
                // Interpret these values as intege
                clean_inputs.latitude = valid(clean_inputs.latitude).toFloat();
                clean_inputs.longitude = valid(clean_inputs.longitude).toFloat();
                var id = clean_inputs.userid,
                    latMin = clean_inputs.latitude - latRange,
                    latMax = clean_inputs.latitude + latRange,
                    longMin = clean_inputs.longitude - longRange,
                    longMax = clean_inputs.longitude + longRange;
                locals.connection.query(QueryStrings.Spot.GET_SPOTS_RAND_NOT_FOUND,
                    [id, id, latMin, latMax, longMin, longMax], callback);
            }
        ], function(err, result) {
            db.EndTransaction(err, result, locals.connection, main_callback);
        })
    },
    createComment: function(params, main_callback) {
        var locals = {};
        var required_inputs = ['userid', 'spotid', 'imageName', 'imagePath', 'comment'];
        async.waterfall([
            db.StartTransaction.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                utils.cleanAndPrune(required_inputs, params, callback);
            },
            function(clean_inputs, callback) {
                locals.clean_inputs = clean_inputs;
                var where = [{spotid: clean_inputs.spotid}, {userid: clean_inputs.userid}];
                locals.connection.query(QueryStrings.Spot.CHECK_VERIFIED, where, callback);
            },
            function(rows, fields, callback) {
                if(!rows || !rows[0]) {
                    callback(true, {
                        success: false,
                        message: 'Spot has not been found'
                    });
                    return;
                }
                this.makeImage({imageName: locals.clean_inputs.imageName, imagePath: locals.clean_inputs.imagePath}, 'comments', callback);
            }.bind(this),
            function(url, callback) {
                var post = {
                    spotid: locals.clean_inputs.spotid,
                    creatorid: locals.clean_inputs.userid,
                    message: locals.clean_inputs.comment,
                    picture: url
                }
                locals.connection.query(QueryStrings.Spot.CREATE_COMMENT, post, callback);
            },
            function(rows, fields, callback) {
                if(rows.insertId) {
                    callback(null,{
                        success: true
                    });
                }
                else {
                    callback(true,{
                        success: false,
                        message: "Unable to create comment"
                    });
                }
            }
        ], function(err, result){
            db.EndTransaction(err, result, locals.connection, main_callback);
        });
    },
    getComments: function(params, main_callback) {
        var locals = {};
        var required_inputs = ['spotid'];
        async.waterfall([
            db.StartTransaction.bind(db),
            function(connection, callback) {
                locals.connection = connection;
                utils.cleanAndPrune(required_inputs, params, callback);
            },
            function(clean_inputs, callback) {
                locals.clean_inputs = clean_inputs;
                var where = {spotid: clean_inputs.spotid};
                locals.connection.query(QueryStrings.Spot.GET_COMMENTS, where, callback);
            }
        ], function(err, result) {
            db.EndTransaction(err, result, locals.connection, main_callback);
        });
    },
    create: function(user, spot, main_callback) {
        var locals = {};
        // TODO: Add story to this at some point maybe
        var required_inputs = ['imageName', 'imagePath', 'latitude', 'longitude', 'story'];
        async.waterfall([
            function(callback) {
                utils.cleanInputs(spot, callback);
            },
            function(clean_inputs , callback) {
                locals.clean_inputs = clean_inputs;
                // Check for missing inputs (including for 'clue')
                utils.inputsMissing(required_inputs, clean_inputs, function(missing){
                    if(missing.length > 0) {
                        callback(true, new Message(errors.General.INPUTS_MISSING, missing));
                    }
                    else {
                        callback();
                    }
                });
            },
            function(callback) {
                utils.pruneSome(required_inputs, locals.clean_inputs, function(pruned){
                    locals.clean_spot = pruned;
                    locals.clue = locals.clean_inputs.clue;
                    db.StartTransaction(callback);
                });
            },
            function(connection, callback) {
                locals.connection = connection;
                this.makeImage({imageName: locals.clean_spot.imageName, imagePath: locals.clean_spot.imagePath}, 'spots', callback);
            }.bind(this),
            function(url, callback) {
                var new_spot = {
                    creatorID: user.id,
                    story: locals.clean_spot.story,
                    picture: url,
                    latitude: locals.clean_spot.latitude,
                    longitude: locals.clean_spot.longitude
                };
                locals.connection.query(QueryStrings.Spot.CREATE, new_spot, callback);
            },
            function(row, fields, callback) {
                var new_clue = {
                    spotID: row.insertId,
                    message: locals.clue,
                    order: 0
                }
                locals.connection.query(QueryStrings.Clue.CREATE, new_clue, callback);
            }
        ], function(err, result) {
            if(err) {
                console.log("SpotCreate:: Err", err);
                console.log("SpotCreate:: Res", result);
            }
            if(locals.connection) {
                db.EndTransaction(err, result, locals.connection, main_callback);
            }
            else {
                main_callback(err, result);
            }
        });
    }
};
module.exports = spot;
