var path = require('path');

function routes(app, passport) {
    // Controllers
    var controllers = require(path.join('..', 'helpers'));

    // Routes
    require('./user')(app, controllers.User);

    // Login/logout
    app.get('/failed', function(req, res) {
        res.send("Login failed");
    });

    // The database helper will verify the user
    app.post('/login',
        passport.authenticate('local',
        {
            failureRedirect: '/failed'
        }), function(req, res)
        {
            //res.redirect('/');
            res.json("Login Successful!");
        }
    );

    // Do these routes last
    app.all('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/', function(req, res){
        res.send("Ello Mate");
    });
}

module.exports = routes;
