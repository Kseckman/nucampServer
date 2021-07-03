var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const autheticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connect.then(()=> console.log('Connected correctly to server'),
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json()); //like body parser
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321')); //cryptographic key to encript and sign cookie

app.use(session({//cant be used with cookieParser
  name: 'session-id',
  secret: '12345-67890-09876-54321',//same as cookie parser key
  saveUninitialized: false,//new session with no updates wont saved
  resave: false,
  store: new FileStore()//used to save session to hard disk.
}));


// middleware to check incoming requests for existing session and load it
app.use(passport.initialize());
app.use(passport.session());

//moved above auth function so they can be accessed
app.use('/', indexRouter);
app.use('/users', usersRouter);

// this is where we add authentication
function auth(req, res, next) {
  console.log(req.user);


  // req.session removed for passport
  if (!req.user) {//signedCokkies:parse signed cookie from request
    // const authHeader = req.headers.authorization; 
    // if (!authHeader) {//now handled by userRouter

    // no verification here now, just check if client is not authenticated, if not use error here.
    const err = new Error('You are not authenticated!');
    // res.setHeader('WWW-Authenticate', 'Basic');//in users.router now
    err.status = 401;
    return next(err);
    // }
    // buffer is a global node class, from(static method) to decode User/pass. Takes auth header and extract user and pass and puts into auth array as 1 and 2 items.

    // const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    // const user = auth[0];
    // const pass = auth[1];
    // if (user === 'admin' && pass === 'password') {
    //     req.session.user = 'admin' //does same as bellow
        // res.cookie('user','admin', {signed: true});//create new cookie secretKey

        // return next(); // authorized
    //   } else {
    //     const err = new Error('You are not authenticated!');
    //     res.setHeader('WWW-Authenticate', 'Basic');
    //     err.status = 401;
    //     return next(err);
    // }
  } else {
    // if (req.session.user === 'authenticated') {//was signedCookies/admin
      return next();
    // } else { //error if not admin
    //   const err = new Error('You are not authenticated!');
    //   err.status = 401;
    //   return next(err);
    // }
  }
}


app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));//users access data


app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});