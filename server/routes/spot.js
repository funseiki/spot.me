/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async');
    allowRequest = require('./checkUser'),

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
            if(err) {
                res.send("Error uploading file :(");
            }
            else {
                res.send("Success!");
            }
        });
    });
}

module.exports = spotRoute;

