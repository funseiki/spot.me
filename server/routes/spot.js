/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async'),
    allowRequest = require('./checkUser'),
    fs = require('fs');

function spotRoute(app, Spot) {
    app.post('/spot/create', allowRequest, function(req, res) {
        var user = req.user;

        var imagePath = req.files.file.path,
            imageName = req.files.file.originalFilename;
        var new_spot = {
            latitude : req.body.latitude,
            longitude : req.body.longitude,
            clue : req.body.clue,
            imagePath: imagePath,
            imageName: imageName,
            story: "Here's a story " // We're not using this yet
        };

        Spot.create(user, new_spot, function(err, resp){
            // Delete the temp file
            fs.unlink(imagePath, function(fileError){
                if(fileError) {
                    console.log("Error deleting file", fileError);
                }
                if(err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.json({success: false, message: "Error creating spot"});
                }
                else {
                    if(resp.message) {
                        res.json(resp);
                    }
                    else {
                        res.json({success: true})
                    }
                }
            });
        });
    });

    app.post('/spot/verify', allowRequest, function(req, res) {
        // Expects:
        // userid
        // latitude
        // longitude
        // spotid

        var userid = req.user.id;
        var spotInfo = {
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            spotid: req.body.spotid
        };

        Spot.verifySpot(userid, spotInfo, function(err, result) {
            if(err) {
               console.log("Routes::/spot/verify::Error", err);
               res.statusCode = 500;
               res.json({success: false, message: "Error"});
            }
            else {
                res.json(result);
            }
        });

       // Returns: {success: true/false}
        //  {success: true, }
    });

    app.post('/spot/list/nearby', allowRequest, function(req, res) {
        // Expects userid
        var userid = req.user.id,
            location = {
                latitude: req.body.latitude,
                longitude: req.body.longitude
            };

        Spot.getAvailableSpots(userid, location, function(err, results) {
            if(err) {
                res.statusCode = 500;
                res.json({
                    message: 'Unable to find spots'
                });
            }
            else {
                res.json(results);
            }
        });
    });

    app.post('/spot/comments/get', allowRequest, function(req, res) {
        // Checks if verified..

        // returns comments: [{userid: <>, imageurl: <>, message: <>, story: <null>}]
    });

    app.post('/spot/comment/create', allowRequest, function(req, res){

        var user = req.user;

        var imagePath = req.files.file.path,
            imageName = req.files.file.originalFilename;
        var new_comment= {
            comment: req.body.comment,
            imagePath: imagePath,
            imageName: imageName,
            spotid: req.body.spotid,
            userid: user.id
        };

        Spot.createComment(new_comment, function(err, resp){
            // Delete the temp file
            fs.unlink(imagePath, function(fileError){
                if(fileError) {
                    console.log("Error deleting file", fileError);
                }
                if(err) {
                    console.log("Routes::/spot/comment/create::Error:", err);
                    res.statusCode = 500;
                    res.json({success: false, message: "Error creating comment"});
                }
                else {
                    res.json(resp);
                }
            });
        });
    });
}

module.exports = spotRoute;

