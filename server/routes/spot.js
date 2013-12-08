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
                    res.json({success: false, message: "Error creating spot"});
                }
                else {
                    res.send({success: true});
                }
            });
        });
    });
}

module.exports = spotRoute;

