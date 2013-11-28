var express = require('express')
,   http = require('http')
,   path = require('path')
,   passport = require('passport')
,   LocalStrategy = require('passport-local').Strategy
,   config = require(path.join(__dirname, 'config'))
,   routes = require(path.join(__dirname, 'routes'))
,   controllers = require(path.join(__dirname, 'helpers'));

var app = express();
app.configure(function()
{
    var public_path = path.join(__dirname, 'public');
    app.set('port', config.url.port);
    app.set('ip', config.url.ip);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.secret.cookie));
    app.use(express.session({secret: config.secret.session}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(require('stylus').middleware(public_path));
    app.use(express.static(public_path));
    app.use(function(req, res, next)
    {
        // We haven't handled our request yet, so we respond with 404
        res.status(404);
        res.send("Couldn't find what you were looking for");
    });
});

// When storing the user, we just want to store the id
passport.serializeUser(function(user, done)
{
    done(null, user);
});

// When retrieving the user, we want to get the entire object
passport.deserializeUser(function(user, done)
{
    done(null, user);
});

// Login with email and password
passport.use(new LocalStrategy(
    {usernameField: 'email', passwordField: 'password'},
    controllers.User.LoginWithEmail.bind(controllers.User)
));


// Establish the routes
routes(app, passport);

http.createServer(app).listen(app.get('port'), app.get('ip'), function()
{
    console.log("Express server listening on port " + app.get('port'));
});
