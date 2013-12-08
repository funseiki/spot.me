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
        console.log("Route::/spot/create::req", req.body);

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
                    res.json({success: false, message: "Error creating spot"});
                }
                else {
                    res.send({success: true});
                }
            });
        });
    });

    app.post('/spot/verify', allowRequest, function(req, res){
        // Expects:
        // user {id: <>}
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

    app.post('/spot/list/current', allowRequest, function(req, res) {
        // Expects:
        // userid
    });

    app.post('/spot/comments/get', allowRequest, function(req, res) {
        // Checks if verified..

        // returns comments: [{userid: <>, imageurl: <>, message: <>, story: <null>}]
    });

    app.post('/spot/comments/create', allowRequest, function(req, res){

    });
}

module.exports = spotRoute;

