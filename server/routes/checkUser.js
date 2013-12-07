function checkUser(req, res, next) {
    // TODO: This is really bad auth, should use a temporary session id instead
    // if(req.user)
    if(req.body.userid) {
        req.user = {id: req.body.userid};
        next();
    }
    else {
        res.statusCode = 403;
        res.json({
            success: false,
            message: "Not logged in"
        });
    }
}

module.exports = checkUser;
