require('./module')();
var exp= null
if(process.env.NODE_ENV == 'production')
{
    console.log("Production");
    exp= require('./production');
}
else
{
    console.log("Development");
    exp= require('./development');
}

// Configure amazon aws
var aws = require('aws-sdk');
aws.config.update(exp.aws.keys);

module.exports = exp;
