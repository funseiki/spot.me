var express = require('express')
,   http = require('http')
,   path = require('path')
,   config = require(path.join(__dirname, 'config'))
,   routes = require(path.join(__dirname, 'routes'));

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

routes(app);

http.createServer(app).listen(app.get('port'), app.get('ip'), function()
{
    console.log("Express server listening on port " + app.get('port'));
});
