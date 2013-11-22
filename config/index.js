require('./module')();
if(process.env.NODE_ENV == 'production')
{
    console.log("Production");
    module.exports = require('./production');
}
else
{
    console.log("Development");
    module.exports = require('./development');
}
