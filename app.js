var express = require("express");
var app = express();

// ========================== 2022-14-04 ==============================

var fs = require('fs');
var https = require('https');

// ====================================================================

var bodyParser = require("body-parser");
var flash = require("connect-flash");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var jquery = require("jquery");
// var User = require("./models/user");
const dotenv = require("dotenv");
dotenv.config();


//======================================================================================================

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

var indexRoutes = require("./routes/index");


app.use(require("express-session")({
    secret: "this is yelp_camp app",
    resave: false,
    saveUninitialized: false
}));



app.use(passport.initialize());
app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



// =============================== DATE =================================
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 

today = yyyy+'-'+mm+'-'+dd;
console.log(today);
var time = new Date();
var HH = time.getHours();
var MM = time.getMinutes();
var SS = time.getSeconds();
time = HH+':'+MM+':'+SS
console.log(time);


  var localTime = new Date();
  var hours = localTime.getHours();
  var minutes = localTime.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  hours = hours < 10 ? '0'+hours : hours;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  console.log(strTime)


// ========================================================================


app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.admin = '';
    next();
});


app.use(indexRoutes);



app.listen(process.env.PORT || 5001, function(){
    console.log("Local Server has Started on port 5000!!");
});



// ========================== 2022-14-04 ==============================

// ==================================================================== 