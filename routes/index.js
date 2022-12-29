var express = require("express");
var router  = express.Router();
var passport = require("passport");
var localStrategy = require("passport-local").Strategy
var multer = require('multer');
var okrabyte = require("okrabyte");
var tesseract = require('node-tesseract');
var middleware = require('../middleware/index');
var User = require("../models/user");
var Property = require("../models/property");
var Offer = require("../models/offer");
var nodemailer = require("nodemailer");
// var upload = multer({dest: './public/uploads/contracts/'})
var upload = multer({dest: './public/uploads/img/'})
var methodOverride = require("method-override");
var bcrypt = require("bcrypt-nodejs");
var db = require("../db");
var fs = require('fs');

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
// console.log(today);
var time = new Date();
var HH = time.getHours();
var MM = time.getMinutes();
var SS = time.getSeconds();

if(HH<10){
        HH='0'+HH
    } 
if(MM<10){
    MM='0'+MM
}

if(SS<10){
    SS='0'+SS
}

time = HH+':'+MM+':'+SS
// console.log(time);

  var localTime = new Date();
  var hours = localTime.getHours();
  var minutes = localTime.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  hours = hours < 10 ? '0'+hours : hours;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  // console.log(strTime)


var obj = 
        {
            a:'123124'
        };

var reqObj = {};        


// Passport authentication

var comparePassword = function(password){
    return bcrypt.compareSync(password,this.password);
    //Return either True or False
}

passport.use('user',new localStrategy( async (username, password, done)=> {

    var sql = `SELECT * from users where isAccountVerified = 1 and username = "${username}" LIMIT 1`;
    try {
        var [user, fields, err] = await db.query(sql)
        if(err){
            console.log(err);
            return done(err);
        }

        if(!user){
            console.log(err);            
            return done(null,false);
        }

        if(!bcrypt.compareSync(password, user[0].password)){
            console.log(err);            
            return done(null,false);
        }

        return done(null,user);        

    } catch (e) {
        console.log("Error: "+e);
        // res.redirect("/");
        return done(null,false);
    }
}));

passport.serializeUser(function(user,done){

    done(null,user[0].id);
});


passport.deserializeUser( async (id,done) => {

    var sql = `SELECT * FROM users where isAccountVerified = 1 and id = ${id} LIMIT 1`
    try {
        var [user, fields, err] = await db.query(sql);
        if(err) return done(err);
        if(user){
            done(null,user);
        }  
        else{                             
            req.flash("error", "User Not Found")    
            res.redirect("/");
        }
        return;
    } catch (e) {
        console.log("Error: "+e);
        res.redirect("/");
        return;
    }
});


// ===========================================================================
//                                  ROUTES
// ===========================================================================

// ================================== INDEX ==================================

router.get("/", async(req, res) => {
    
        var sql = "SELECT * FROM property"
        try {
            const [rows, fields, err] = await db.query(sql);
            res.render("index_2", {properties: rows});
            // res.send("indexpage");
            return;
        } catch(e) {
            console.log(e);
            res.send("Error openning the page");
            return;
        }
});

router.get("/property_booking/30926087590017694:id", async(req, res) => {
        
        var propertyid = req.params.id;
        var num = 1;

        var sql = `SELECT * FROM property WHERE id = ${propertyid} LIMIT 1`
        // somehow totalclicks+1 returns totalclicks+2
        var sql1 = `UPDATE property set totalclicks = (totalclicks + ${num} ) WHERE id = ${propertyid}`
        try {
            const [rows, fields, err] = await db.query(sql);
            const [rows1, fields1, err1] = await db.query(sql1);

            res.render("booking", {foundProperty: rows[0]});
            // res.send("indexpage");
            return;
        } catch(e) {
            console.log(e);
            res.send("Error openning the page");
            return;
        }
});

router.post("/confirm_booking/30926087590017694:id", async(req, res) => {
        
        var propertyid = req.params.id;
        var startdate = req.body.startdate;
        var totalmonths = req.body.totalmonths;

        var sql = `SELECT * FROM property WHERE id = ${propertyid} LIMIT 1`
        try {
            const [rows, fields, err] = await db.query(sql);

            res.render("confirm_booking", {foundProperty: rows[0],totalmonths:totalmonths,startdate:startdate});
            return;
        } catch(e) {
            console.log(e);
            res.send("Error openning the page");
            return;
        }
});

router.post("/confirm_policy/30926087590017694:id", async(req, res) => {
        
        var propertyid = req.params.id;
        var startdate = req.body.startdate;
        var totalmonths = req.body.totalmonths;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var message = req.body.message;
        var contactnum = req.body.contactnum;
        var bankid = req.body.bankid;

        var sql = `SELECT * FROM property WHERE id = ${propertyid} LIMIT 1`
        try {
            const [rows, fields, err] = await db.query(sql);

            res.render("confirm_policy", {foundProperty: rows[0],totalmonths:totalmonths,startdate:startdate,propertyid:propertyid,firstname:firstname,lastname:lastname,email:email,message:message,contactnum:contactnum});
            return;
        } catch(e) {
            console.log(e);
            res.send("Error openning the page");
            return;
        }
});

router.post("/confirm_reservation/30926087590017694:id", async(req, res) => {
        
        var propertyid = req.params.id;
        var startdate = req.body.startdate;
        var totalmonths = req.body.totalmonths;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var message = req.body.message;
        var contactnum = req.body.contactnum;
        var bankid = req.body.bankid;

        var sql = `SELECT * FROM property WHERE id = ${propertyid} LIMIT 1`
        var sql1 = `SELECT * FROM banks WHERE id = ${bankid} LIMIT 1`
        try {
            const [rows, fields, err] = await db.query(sql);
            const [rows1, fields1, err1] = await db.query(sql1);

            res.render("confirm_reservation", {foundProperty: rows[0],totalmonths:totalmonths,startdate:startdate,propertyid:propertyid,firstname:firstname,lastname:lastname,email:email,message:message,contactnum:contactnum,bank: rows1[0]});
            return;
        } catch(e) {
            console.log(e);
            res.send("Error openning the page");
            return;
        }
});

router.get("/property_booking/*", async(req, res) => {

    res.render("booking", {foundProperty: null})
});



router.get("/admin_home",checkIfAdmin,function(req, res){
    res.render("admin_home");
});



router.get("/add_listing",checkIfAdmin,async(req, res) => {
    var sql = `SELECT * FROM banks`
    try {
        
        const [rows, fields, err] = await db.query(sql);
        res.render("add_listing", {banks: rows});
        return;
    } catch(e) {
        console.log(e);
        res.send("Error adding property, " + e)
        return;
    }
});

router.get("/show_listings",checkIfAdmin,async(req, res) => {

    var sql = `SELECT * FROM property`

    try {
        const [rows, fields, err] = await db.query(sql);

        res.render("show_listings", {properties: rows});        
        return;
    } catch(e) {
        console.log(e);
        res.send("Error openning the page");
        return;
    }

});

// ===================== Banks ===========================

router.get("/add_bank",checkIfAdmin,function(req, res){
    res.render("add_bank");
});

router.get("/show_banks",checkIfAdmin,async(req, res) => {

    var sql = `SELECT * FROM banks`
    try {
        const [rows, fields, err] = await db.query(sql);

        res.render("show_banks", {banks: rows});        
        return;
    } catch(e) {
        console.log(e);
        res.send("Error openning the page");
        return;
    }

});

router.post("/add_bank", checkIfAdmin ,async(req, res)=>{

        var name = req.body.name;
        var iban = req.body.iban;
        var swift = req.body.swift;
        var bank = req.body.bank; 

        var localTime1 = new Date()
        var nyd = new Date(localTime1);
         
        nyd = nyd.toLocaleString('en-US', { timeZone: 'America/New_York' })
        
        var nyt = nyd.substring(nyd.indexOf(',')+1);
        nyd = nyd.split(',')[0];
        var offercreateddate = nyd+nyt;            
        var sql1 = `INSERT INTO banks (name,iban,swift,bank) VALUES ("${name}","${iban}","${swift}","${bank}") `
        try {
            var [result, fields, err] = await db.query(sql1);
            req.flash("success", 'Bank details has been successfully added.');
            res.redirect("/show_banks");                                
            
            return;
        } catch(e){
            console.log(e);
            req.flash("error", 'Some error occured while adding new bank details.');
            res.redirect("/add_bank");
        }
})

router.delete("/delete_bank/:id", checkIfAdmin ,async(req, res)=>{
   var id = req.params.id;
   var sql = `DELETE FROM banks WHERE id = ${id}`
    try {
        var[result, fields, err] = await db.query(sql);
        req.flash("success", "Bank Successfully Removed.");
        res.redirect("/show_banks")
        return;
    } catch(e){
        req.flash("error", e);
        res.redirect("/show_banks");
        return;
    }
});

// ==================== Bank End ============================

router.post("/add_listing",checkIfAdmin,upload.fields([{name: 'propertyimage'},{name: 'propertyimage2'},{name:'hostimage'},{name: 'propertyimage3'},{name: 'propertyimage4'},{name: 'propertyimage5'},{name: 'propertyimage6'},{name: 'propertyimage7'},{name: 'propertyimage8'},{name: 'propertyimage9'},{name: 'propertyimage10'}]) ,async(req, res)=>{

    if(req.files) {
        // var id = req.params.id;
        // var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`
        try {
            // var[foundProperty, fields, err] = await db.query(sql);
            var propertyname = req.body.propertyname
            var squaremeters = req.body.squaremeters
            var city = req.body.city
            var state = req.body.state
            var zipcode = req.body.zipcode
            var rent = parseInt(req.body.rent).toLocaleString();
            var hostname = req.body.hostname
            var hostemail = req.body.hostemail
            var rooms = req.body.rooms
            var description = req.body.description
            var imagecaption = req.body.imagecaption
            var bankid = req.body.bankid
            var totalclicks = 0

            var hostimage 

            var propertyimage 
            var propertyimage2 
            var propertyimage3 
            var propertyimage4 
            var propertyimage5 
            var propertyimage6 
            var propertyimage7 
            var propertyimage8 
            var propertyimage9 
            var propertyimage10 

            if(req.files['hostimage']){
                 hostimage = req.files['hostimage'][0].path;
                 hostimage = hostimage.replace(/\\/g, "\\/")
            } else {
                hostimage = '';
            }
            if(req.files['propertyimage']){
                 propertyimage = req.files['propertyimage'][0].path;
                  propertyimage = propertyimage.replace(/\\/g, "\\/")
            } else {
                propertyimage = '';
            }
            if(req.files['propertyimage2']){
                 propertyimage2 = req.files['propertyimage2'][0].path;
                  propertyimage2 = propertyimage2.replace(/\\/g, "\\/")
            } else {
                propertyimage2 = '';
            }
            if(req.files['propertyimage3']){
                 propertyimage3 = req.files['propertyimage3'][0].path;
                  propertyimage3 = propertyimage3.replace(/\\/g, "\\/")
            } else {
                propertyimage3 = '';
            }
            if(req.files['propertyimage4']){
                 propertyimage4 = req.files['propertyimage4'][0].path;
                  propertyimage4 = propertyimage4.replace(/\\/g, "\\/")
            } else {
                propertyimage4 = '';
            }
            if(req.files['propertyimage5']){
                 propertyimage5 = req.files['propertyimage5'][0].path;
                  propertyimage5 = propertyimage5.replace(/\\/g, "\\/")
            } else {
                propertyimage5 = '';
            }
            if(req.files['propertyimage6']){
                 propertyimage6 = req.files['propertyimage6'][0].path;
                  propertyimage6 = propertyimage6.replace(/\\/g, "\\/")
            } else {
                propertyimage6 = '';
            }
            if(req.files['propertyimage7']){
                 propertyimage7 = req.files['propertyimage7'][0].path;
                  propertyimage7 = propertyimage7.replace(/\\/g, "\\/")
            } else {
                propertyimage7 = '';
            }
            if(req.files['propertyimage8']){
                 propertyimage8 = req.files['propertyimage8'][0].path;
                  propertyimage8 = propertyimage8.replace(/\\/g, "\\/")
            } else {
                propertyimage8 = '';
            }
            if(req.files['propertyimage9']){
                 propertyimage9 = req.files['propertyimage9'][0].path;
                  propertyimage9 = propertyimage9.replace(/\\/g, "\\/")
            } else {
                propertyimage9 = '';
            }
            if(req.files['propertyimage10']){
                 propertyimage10 = req.files['propertyimage10'][0].path;
                  propertyimage10 = propertyimage10.replace(/\\/g, "\\/")
            } else {
                propertyimage10 = '';
            }

            var localTime1 = new Date()
            var nyd = new Date(localTime1);
             
            nyd = nyd.toLocaleString('en-US', { timeZone: 'America/New_York' })
            
            var nyt = nyd.substring(nyd.indexOf(',')+1);
            nyd = nyd.split(',')[0];
            var offercreateddate = nyd+nyt;            
            var sql1 = `INSERT INTO property (propertyname,squaremeters,rent,city,state,zipcode,hostname,hostemail,hosimage,propertyimage,rooms,description,propertyimage2,totalclicks,imagecaption,propertyimage3,propertyimage4,propertyimage5,propertyimage6,propertyimage7,propertyimage8,propertyimage9,propertyimage10, bankid) VALUES ("${propertyname}","${squaremeters}","${rent}","${city}","${state}","${zipcode}","${hostname}","${hostemail}","${hostimage}","${propertyimage}","${rooms}","${description}","${propertyimage2}","${totalclicks}","${imagecaption}","${propertyimage3}","${propertyimage4}","${propertyimage5}","${propertyimage6}","${propertyimage7}","${propertyimage8}","${propertyimage9}","${propertyimage10}","${bankid}") `
            try {
                var [result, fields, err] = await db.query(sql1);
                req.flash("success", 'Property listing has been successfully created. ');
                
                res.redirect("/show_listings");                                
                
                return;
            } catch(e){
                console.log(e);
                req.flash("error", 'Some error occured while adding new property.');
                res.redirect("/add_listing");
            }
            return;
        } catch(e){
            console.log(e);
            req.flash("error", 'Try Again Later');            
            res.redirect("/add_listing");
            return;
        }

    } else {
        req.flash("error", "Please upload valid Images");
        res.redirect("/add_listing");
    }
})

router.delete("/delete/:id", checkIfAdmin ,async(req, res)=>{
   var id = req.params.id;
   var sql = `DELETE FROM property WHERE id = ${id}`
    try {
        var[result, fields, err] = await db.query(sql);
        req.flash("success", "Property Successfully Removed.");
        res.redirect("/show_listings")
        return;
    } catch(e){
        req.flash("error", e);
        res.redirect("/show_listings");
        return;
    }
});


// Show login form
router.get("/admin_login", function(req, res) {
    res.render("admin_login"); 
});


// Handle login logic
router.post("/admin_login",passport.authenticate("user", {
    successRedirect: "/admin_home",
    failureRedirect: "/admin_login"
}) ,function(req, res) {
    
});

// logout User
router.get("/logout", function(req, res) {

    req.logout();
    req.flash("success", "Sucessfully logged you out !!!");
    res.redirect("/");
    
});


function checkIfAdmin(req, res, next){

    if(req.isAuthenticated()){
        var obj = {
            a:'123124'
        };
        var b = req.user[0];
        if(b.id = '123124'){
            next();
        }
        else{
            req.flash("error", "You do not have permission to Access the route !!!");
            res.redirect("/");
        }
    }
    else{
        console.log("Login to Continue");
        req.flash("error","Please login to continue!!")
        res.redirect("/admin_login");
    }
}


function checkIfLoggedIn(req, res, next){

    if(req.isAuthenticated()){
        next();
    }
    else{
        req.flash("error", "You need to login to continue");
        res.redirect("/login");
    }
}


module.exports = router;