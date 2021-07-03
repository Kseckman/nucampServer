const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');;//has access to passportlocal
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;//helper methods
const jwt = require('jsonwebtoken'); //create sign verify tokens

const config = require('./config.js');//has secretKey

                   //specific strategy plugin  . verified callback function
exports.local = passport.use(new LocalStrategy(User.authenticate()));
// deserialization, user data has to be grabbed, serialization, convert to store
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = user => {//id for user document
    return jwt.sign(user, config.secretKey, ({expiresIn: 3600}));//token
};

//declaire constant for options for jwt strategy.
const opts = {};
//json web token below
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();;
opts.secretOrKey = config.secretKey; //supply jwt strat with key for token

//takes instance of jwt strat as an argument, check passport configure strategy docs
exports.jwtPassport = passport.use(
    new JwtStrategy(//constructor
        opts,
        (jwt_payload,done) =>{//verified callback function, passport 
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);//no user
                } else if (user) {
                    return done(null, user);//no error, gives user from passport.
                } else {
                    return done(null, false);// no error or user
                }
            });
        }
     )
 );


//  verify incoming request is from authentic user with jwt not sessions
exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin = (req, res, next) =>{
    if(req.user.admin){
        return next()
    } else {
        const err = new Error('User is not an Admin');
        err.status = 403
        return next(err)
    }
}