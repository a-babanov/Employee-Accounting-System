const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const logger = require('morgan');
const hbs = require("hbs");
const session = require("express-session");
const MySQLStore = require('express-mysql-session')(session);

const usersLoginRouter = require('./routes/users_login');
const usersSignInRouter = require('./routes/users_sign_in');
const indexRouter = require('./routes/index');
const logoutRouter = require('./routes/logout');
const employeeRouter = require('./routes/employee');
const myReportCardRouter = require('./routes/my_report_card');
const allReportCardsRouter = require('./routes/all_report_cards');
const reportsRouter = require('./routes/reports');
const organizationRouter = require('./routes/organization');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname + "/views/partials"));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


var options = {
    connectionLimit: 5,
    host: "127.0.0.1",
    user: "root",
    database: "employeedb"
}
    
var sessionStore = new MySQLStore(options); /* session store options */

app.use(
    session({
        store: sessionStore,
        resave: true,
        saveUninitialized: false,
        secret: "superSecret"
    })
); 

app.use('/', usersLoginRouter);
app.use('/', usersSignInRouter);
app.use('/', indexRouter);
app.use('/', logoutRouter);
app.use('/', employeeRouter);
app.use('/', myReportCardRouter);
app.use('/', allReportCardsRouter);
app.use('/', reportsRouter);
app.use('/', organizationRouter);

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

module.exports = app;
