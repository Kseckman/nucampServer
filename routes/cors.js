const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
}
//cors returns middleware function configured cors headder of access control allow origin on response object with wildcard as value. allows cors for all origins.
exports.cors = cors();
//cors returns function. check to see if incoming request belongs to whitelisted origins, localhosts. will send back, cors response header of access control allow origin, with whitelisted origin as value.
exports.corsWithOptions = cors(corsOptionsDelegate);