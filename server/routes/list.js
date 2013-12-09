/*************************************
 * API Endpoint to obtain user information
 * /list/
 **************************************/
var check = require('validator').check,
    config = require('../config'),
    async = require('async'),
    allowRequest = require('./checkUser'),
    fs = require('fs');

function listRoute(app, List) {
    app.post('/list/create', allowRequest, function(req, res) {
        var listInputs = {
            ownerid: req.user.id,
            title: req.body.title,
            latitude: req.body.latitude,
            longitude: req.body.longitude
        };

        List.createFromRandom(listInputs, function(err, results) {
            if(err) {
                console.log("Routes::/list/create::Error: ", err);
                res.statusCode = 500;
                res.json({
                    success: false,
                    message: "Unable to create list"
                });
                return;
            }
            res.json(results);
        });
    });

    app.post('/list/nearby', allowRequest, function(req, res) {

    });
}

module.exports = listRoute;