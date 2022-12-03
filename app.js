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
var User = require("./models/user");


// var promise = mongoose.connect('mongodb://akberhussain:123abc..@cluster0.qhauv.mongodb.net/mydbforminkoffers?retryWrites=true&w=majority', {
//   useMongoClient: true,
// });

// const username = "<mongodb username>";
// const password = "<password>";
// const cluster = "<cluster name>";
// const dbname = "myFirstDatabase";



// async function main () {
//     try {
// 		mongoose.connect(
// 		  `mongodb+srv://akberhussain:123abc..@cluster0.qhauv.mongodb.net/mydbforminkoffers?retryWrites=true&w=majority`, 
// 		  {
// 		    useNewUrlParser: true,
// 		    useFindAndModify: false,
// 		    useUnifiedTopology: true
// 		    // ,useMongoClient: true   
// 		  }
// 		);

//     } catch (e) {
//         console.error(e);
//     } 
// }

// main().catch(console.error);


// mongoose.connect(
//   `mongodb+srv://akberhussain:123abc..@cluster0.qhauv.mongodb.net/mydbforminkoffers?retryWrites=true&w=majority`, 
//   {
//     useNewUrlParser: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//     // ,useMongoClient: true   
//   }
// );

  // useMongoClient: true,
  // autoIndex: false, // Don't build indexes
  // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  // reconnectInterval: 500, // Reconnect every 500ms
  // poolSize: 10, // Maintain up to 10 socket connections
  // // If not connected, return errors immediately rather than waiting for reconnect
  // bufferMaxEntries: 0


// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error: "));
// db.once("open", function () {
//   console.log("Connected successfully");
// });

//=======================================================================================================

// const { MongoClient } = require('mongodb');

// async function main () {
//     var uri = "mongodb+srv://akberhussain:123abc..@cluster0.qhauv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

//     var client = new MongoClient(uri);

//     try {
//         await client.connect();
//         await listDatabases(client);

//     } catch (e) {
//         console.error(e);
//     } finally {
//         await client.close();
//     }
// }

// main().catch(console.error);

// async function listDatabases(client) {
//     const results = await client.db().admin().listDatabases();

//     console.log("databases");
//         console.log(mongoose.connection.readyState);

//     results.databases.forEach(db => {
//         console.log(`- ${db.name}`)
//     })    
// }
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


// app.all('*', function(req, res, next){
//     // console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
//     if (req.secure) {
//         return next();
//     }

//     res.redirect('https://'+'www.minkoffers.com:8443' + '' + req.url);
// });

app.use(indexRoutes);


// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Helpbit Server has Started on port 3000 !!");
// });


app.listen(process.env.PORT || 3000, function(){
    console.log("Local Server has Started on port 3000 !!");
});

// console.log(ssl.key);
//  console.log(ssl.cert);

// ========================== 2022-14-04 ==============================


 // app.set('port', process.env.SSLPORT || 8443);

// var server = https.createServer(options, app);

// server.listen(process.env.SSLPORT || 8443, () => {
//     console.log('Express server listening on port ' + app.get('port'));
// });

// const http = require('http');
// http.createServer(app).listen(8080)
// https.createServer(options, app).listen(8443)
// ====================================================================