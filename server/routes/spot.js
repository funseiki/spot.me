/*************************************
 * API Endpoint to obtain user information
 * /user/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async');

function spotRoute(app, Spot) {
    app.post('/spot/create', function(req, res) {
        var imagePath = req.files.file.path,
            imageName = req.files.file.originalFilename;
        Spot.create(req.user, {imagePath: imagePath, imageName: imageName}, function(err, resp){
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

