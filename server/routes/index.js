var path = require('path');

function routes(app, passport) {
    // Controllers
    var controllers = require(path.join('..', 'helpers'));

    // Routes
    require('./user')(app, controllers.User);
    require('./spot')(app, controllers.Spot);

    // Login/logout
    app.get('/failed', function(req, res) {
        res.json(401, {message: "Login Failed!"});
    });

    // The database helper will verify the user
    app.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/failed'
        }), function(req, res) {
            res.json("Login Successful!");
        }
    );

    // Do these routes last
    app.all('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/', function(req, res){
        res.render("imageform");
    });
}

module.exports = routes;
