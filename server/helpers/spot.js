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
                knoxClient.putFile(locals.clean_image.imagePath, '/'+ s3Folder+'/' + token + path.extname(locals.clean_image.imageName), {'x-amz-acl': 'public-read'}, function(err, res){
                  // Always either do something with `res` or at least call `res.resume()`.
                    if(res) res.resume();
                    callback(err, res);
                }).on('error', function(e){ console.log("Error: " + e.message); });
            }
        ], function(err, res){
            main_callback(err, res);
        });
    },
    create: function(user, spot, main_callback) {
        this.makeImage(spot, 'spots', function(err, result) {
            main_callback(err, result);
        });
    }
};
module.exports = spot;
