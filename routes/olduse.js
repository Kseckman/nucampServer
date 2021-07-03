const express = require('express');
const User =  require('../models/user');
const passport = require('passport');//provides methods for registering and logging in users

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// user registration mechanism
router.post('/signup', (req, res, next)=> {
  //passportLocalMongose. static method on user model.
  User.register(
    new User({username: req.body.username}),
    req.body.password,
    err => {
      if (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: err});
      } else {
        passport.authenticate('local')(req, res, () => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});//sends response
        })
      }
    }
  );


// without passport below**

  // User.findOne({username: req.body.username})
  // .then(user => {
  //   if (user) {//if name is taken
  //     const err = new Error(`User ${req.body.username} already exists!`);
  //     err.status = 403;
  //     return next(err)
  //   } else {//create new user
  //     User.create({
  //       username: req.body.username,
  //       password: req.body.password
  //     })
  //     .then(user => {
  //       res.statusCode = 200;
  //       res.setHeader('Content-Type', 'application/json');
  //       res.json({status: 'Registration Successful!', user: user});
  //     })
  //     .catch(err => next(err));
  //   }
  // })
  // .catch(err => next(err));//if findOne goes wrong
})

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  //passport auth handles logging, credentials, parsing credentials..
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});



  // if (!req.session.user) {//user not logged in yet
  //   const authHeader = req.headers.authorization;
  //   if (!authHeader) {
  //       const err = new Error('You are not authenticated!');
  //       res.setHeader('WWW-Authenticate', 'Basic');
  //       err.status = 401;
  //       return next(err);
  //   }

  //   const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  //   const username = auth[0];
  //   const password = auth[1];

  //   User.findOne({username: username})//see if there is a match
  //   .then(user => {
  //     if (!user) {//if wrong username
  //       const err = new Error(`User ${username} does not exist!`)
  //       err.status = 401;
  //       return next(err);
  //     } else if (user.password !== password) {//if wrong password
  //       const err = new Error('Your password is incorrect!');
  //       err.status = 401;
  //       return next(err);
  //     } else if (user.username === username && user.password === password) {//if successful loggin
  //       req.session.user = 'authenticated';
  //       res.statusCode = 200;
  //       res.setHeader('Content-Type', 'text/plain');
  //       res.end('You are authenticated!');
  //     }
  //   })
  //   .catch(err => next(err));;
  // } else {//if session/client is already tracked/logged in
  //   res.statusCode= 200;
  //   res.setHeader('Content-Type', 'text/plain');
  //   res.end('You are already authenticated!');
  // }
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

