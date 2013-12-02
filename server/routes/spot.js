/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async');

function spotRoute(app, Spot) {
    app.post('/spot/create', function(req, res) {
        // TODO: Change this
        var user = {id: 12};

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

