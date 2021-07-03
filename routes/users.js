const express = require('express');
const User =  require('../models/user');
const passport = require('passport');//provides methods for registering and logging in users
const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, function(req, res) {
  res.send('respond with a resource');
});

// user registration mechanism
router.post('/signup', (req, res)=> {
  //passportLocalMongose. static method on user model.
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    (err, user)=> {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
        // if name is sent, set name to user
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname){
          user.lastname = req.body.lastname;
        }
        user.save(err =>{
          if (err){
            res.statusCoode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true, status: 'Registration Successful!'});//sends response
          });
        });
      }
    }
  );
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  //passport auth handles logging, credentials, parsing credentials..
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();//ends session on server side
    res.clearCookie('session-id')//express method on res sesion name in app.js.
    res.redirect('/');//redirects to localhost
  } else {//if session doesnt exist
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});

module.exports = router;
