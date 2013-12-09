var path = require('path');

function routes(app, passport) {
    // Controllers
    var controllers = require(path.join('..', 'helpers'));

    // Routes
    require('./user')(app, controllers.User);
    require('./spot')(app, controllers.Spot);

    // Login/logout
    // The database helper will verify the user
    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, user, info){
            if(err) {return next(err); }
            var responseObj = { };
            if(!user) {
                responseObj.login_success = false;
                responseObj.message = info.message;
                return res.json(responseObj);
            }
            req.logIn(user, function(err){
                if(err) {
                    return next(err);
                }
                responseObj.login_success = true;
                responseObj.userid = user.id;
                res.json(responseObj);
            });
        })(req, res, next);
    });

    // Do these routes last
    app.all('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/testverify', function(req, res){
        res.render("spotverify");
    });

    app.get('/testspotget', function(req, res){
        res.render("getspots");
    });


    app.get('/', function(req, res){
        res.render("register");
    });

}

module.exports = routes;
