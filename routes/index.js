function routes(app) {
    // Routes
    app.get('/', function(req, res){
        res.send("Ello Mate");
    });
}

module.exports = routes;
