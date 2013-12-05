var db = require('./database'),
    utils = require('./utils'),
    errors = require('./errors').User,
    async = require('async'),
    bcrypt = require('bcrypt'),
    sanitizer = require('sanitizer'),
    QueryStrings = require('./queryStrings'),
    Message = require('./clientMessage'),
    config = require('../config'),
    knox = require('knox'),
    AWS = require('aws-sdk'),
    path = require('path');

var s3 = new AWS.S3();
var knoxClient = knox.createClient({
    key: config.aws.keys.accessKeyId,
    secret: config.aws.keys.secretAccessKey,
    region: config.aws.keys.region,
    bucket: config.aws.bucket
});

var spot = {
    makeImage: function(imageData, s3Folder, main_callback) {
        var locals = {};
        async.waterfall([
            function(callback) {
                utils.inputsMissing(['imageName', 'imagePath'], imageData, function(result){
                    var err = null;
                    if(result > 0) {
                        callback(result);
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
                knoxClient.putFile(locals.clean_image.imagePath, locals.url, {'x-amz-acl': 'public-read'}, function(err, res){
                  // Always either do something with `res` or at least call `res.resume()`.
                    if(res) res.resume();
                    callback(err, res);
                }).on('error', function(e){ console.log("makeImage: onError", e); });
            }
        ], function(err, res){
            console.log("makeImage: Err", err);
            main_callback(err, "https://s3.amazonaws.com/" +config.aws.bucket + locals.url);
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
                        callback(true);
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
            console.log("SpotCreate:: Err", err);
            console.log("SpotCreate:: Res", result);
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
