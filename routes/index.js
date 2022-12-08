var express = require("express");
var router  = express.Router();
// var mongoose = require("mongoose");
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
    // connection.query(sql, function(err, user){

        // if(err){
        //     return done(err);
        // }

        // if(!user){
        //     return done(null,false);
        // }

        // if(!bcrypt.compareSync(password, user[0].password)){
        //     return done(null,false);
        // }

        // return done(null,user);        
    // })
}));

//passport Serialization
// passport.serializeUser(function(user,done){
//     done(null,user._id);
// });

passport.serializeUser(function(user,done){

    done(null,user[0].id);
});

// DESERIALIZING USER


// passport.deserializeUser(function(id,done){

//     User.findById(id,function(err,user){

//         if(err) return done(err);
        
//         if(user){
//             done(null,user);
//         }
        
//         else{                             
//          req.flash("error", "User Not Found")    
//          res.redirect("/");
//         }
//     })
    
// });

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

// router.get("/", async(req, res) => {
    
//         var sql = "SELECT * FROM Property"
//         try {
//             const [rows, fields, err] = await db.query(sql);
//             res.render("index", {properties: rows});
//             return;
//         } catch(e) {
//             console.log(e);
//             res.send("Error openning the page");
//             return;
//         }
// });


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

        var sql = `SELECT * FROM property WHERE id = ${propertyid} LIMIT 1`
        try {
            const [rows, fields, err] = await db.query(sql);

            res.render("confirm_reservation", {foundProperty: rows[0],totalmonths:totalmonths,startdate:startdate,propertyid:propertyid,firstname:firstname,lastname:lastname,email:email,message:message,contactnum:contactnum});
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



router.get("/add_listing",checkIfAdmin,function(req, res){
    res.render("add_listing");
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

// router.get("/viewsellers",checkIfAdmin,async(req, res) => {

//     var sql = `Select u.id as userid,p.sellername,p.selleremail,CONCAT(p.streetno," ",p.streetname," ", p.city, " ", p.state," ") AS property,p.id as propertyid,count(o.id) As offers  from Property p
//     left join Offers o on p.id = o.propertyid
//     left join Users u on u.username = p.selleremail
//     Group By u.id,p.sellername,p.selleremail,CONCAT(p.streetno," ",p.streetname," ", p.city, " ", p.state," "),p.id
//     order by p.sellername,CONCAT(p.streetno," ",p.streetname," ", p.city, " ", p.state," "),p.id;`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("view_sellers", {sellers: result});
//         return;
//     } catch(e) {
//         console.log(e);
//         req.flash("error", "An Unknown Error Occured. Please try again later!");
//         res.redirect("back");
//         return;
//     }

    
// });

// router.get("/view_all_users",checkIfAdmin,async(req, res) => {

//     var sql = `Select id,name,username,address,originalpassword from Users
//     where username <> "minkoffers@gmail.com" 
//     Order by name;`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("view_users", {users: result});
//         return;
//     } catch(e) {
//         console.log(e);
//         req.flash("error", "An Unknown Error Occured. Please try again later!");
//         res.redirect("back");
//         return;
//     }    
// });

// router.get("/view_all_listings/:id",checkIfAdmin,async(req, res) => {
//     var propertyid = req.params.id;
     
//     var sql = `select CONCAT(p.streetno," ",p.streetname," ", p.city, " ", p.state," ") As Property,
//     o.agentname,o.agentemail,o.agentcontact,o.purchaseprice,o.escrowamount,o.escrowfunds,o.payment,o.homewarranty,
//     concat(o.contingency," days") as HomeInspection,o.otherprovisions,o.closingdate,o.expirationtime,o.contract,
//     sellerdisc,leadbasedpaint,preapproval,otherdocs,escalation1,escalation2,appraisalgap,o.offercreateddate,o.id as offerid
//     from Property p
//     INNER JOIN Users u on p.selleremail = u.username
//     INNER JOIN Offers o on p.id = o.propertyid
//     WHERE p.id = ${propertyid}
//     Order by o.id desc`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("view_all_offers", {offers: result});
//         return;
//     } catch(e) {
//         console.log(e);
//         req.flash("error", "An Unknown Error Occured. Please try again later!");
//         res.redirect("back");
//         return;
//     }
// });

// router.get("/view_offers/:id",checkIfLoggedIn,async(req, res)=>{

//     var userid = req.user[0].id;
//     var sql = `select CONCAT(p.streetno," ",p.streetname," ", p.city, " ", p.state," ") As Property,
//     o.agentname,o.agentemail,o.agentcontact,o.purchaseprice,o.escrowamount,o.escrowfunds,o.payment,o.homewarranty,
//     o.contingency as HomeInspection,o.otherprovisions,o.closingdate,o.expirationtime,o.contract,
//     sellerdisc,leadbasedpaint,preapproval,otherdocs,escalation1,escalation2,appraisalgap,o.offercreateddate
//     from Property p
//     INNER JOIN Users u on p.selleremail = u.username
//     INNER JOIN Offers o on p.id = o.propertyid
//     WHERE u.id = ${userid}
//     Order by o.id desc`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("view_offers", {offers: result});
//         return;
//     } catch(e) {
//         console.log(e);
//         req.flash("error", "An Unknown Error Occured. Please try again later!");
//         res.redirect("back");
//         return;
//     }
// });



// router.post("/add_property", checkIfAdmin, async(req, res)=>{
    
//     var streetno = req.body.streetno
//     var streetname = req.body.streetname
//     var city = req.body.city
//     var state = req.body.state
//     var zipcode = req.body.zipcode
//     var sellername = req.body.sellername
//     var selleremail = req.body.selleremail
    
//     var sql = `INSERT INTO Property (streetno, streetname, city, state, zipcode, sellername, selleremail) VALUES ("${streetno}", "${streetname}","${city}","${state}","${zipcode}","${sellername}","${selleremail}")`
//     try{
//         var [result, fields, err] = await db.query(sql);
//         req.flash("success", "Property listing created " + req.body.streetno+" "+req.body.streetname+" "+req.body.city+" "+req.body.state);
//         res.redirect("/");
//         return;

//     } catch(e){
//         console.log(e);
//         req.flash("error", "Please try again with correct data");
//         res.redirect("/");
//         return;        
//     }

// })


// router.get("/edit/:id", checkIfAdmin, async(req, res)=>{
//     var id = req.params.id
//     var sql = `Select * from Property where id = ${id} LIMIT 1`;
//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("edit_property", {foundProperty:result[0]});
//         return;
//     } catch(e){
//         req.flash("error", "Please try again");
//         res.redirect("/");
//         return;
//     }
// })

// router.put("/reset_password/:id",checkIfAdmin,async(req, res)=>{
    
//     var id = req.params.id;
//     var salt = bcrypt.genSaltSync(10);
//     var password = bcrypt.hashSync("abc 123",salt,null)

//     var sql = `UPDATE Users SET password = "${password}", originalpassword = "abc 123" where id = "${id}" ;`
//     var sql2 = `Select * from Users where id = "${id}" Limit 1;`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         var [result1, fields1, err1] = await db.query(sql2);
//         var nodemailer = require('nodemailer');
//         var transporter = nodemailer.createTransport({ 
//         host: "p3plzcpnl484003.prod.phx3.secureserver.net",  
//         port: 587,
//             auth: {
//             user: "Donna_M@minkoffers.com",
//             pass: 'minkoffers123'
//          },
//          tls:
//          {
//             rejectUnauthorized:false
//          },
//         connectionTimeout: 5 * 60 * 1000, // 5 min
//         });

//         var mailOptions = {
//           from: '"MinkOffers" <Donna_M@minkoffers.com>',
//           to: 'flatfeemink@gmail.com,'+result1[0].username,
//           subject: 'Password Reset Successfully',
//           html: '<h3>Hello '+result1[0].name+'. We received a password reset request from you. </h3> <br>We have reset your password against this email address to abc 123, You can use this password to login at https://www.minkoffers.com . Please change your password to something stronger. If this was not from you, please reply to this email. <br>Thank You.<br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746 '
//         //   attachments: [{
//         //     filename: 'repair_request.pdf',
//         //     path: req.file.path,
//         //     contentType: 'application/pdf'
//         //   }],
//         };
//         transporter.sendMail(mailOptions, function(error, info){
//           if (error) {
//             console.log(error);
//             req.flash("error", 'Error: ' + error);
//             res.redirect("/");
//           } else {
//             console.log('Email sent: ' + info.response);
//             console.log("Password Reset Request Sent");
//           }
//         });
//         req.flash("success", "Password Reset Successfully and Email Sent!!!");
//         res.redirect("/")
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error", "Error occured while resetting password. Try Again Later!!!");
//         res.redirect("/");
//         return;
//     }     
    
// })


// router.put("/updateproperty/:id",checkIfAdmin,async(req, res)=>{
    
//     var id = req.params.id;
//     var streetno = req.body.streetno
//     var streetname = req.body.streetname
//     var city = req.body.city
//     var state = req.body.state
//     var zipcode = req.body.zipcode
//     var sellername = req.body.sellername
//     var selleremail = req.body.selleremail

//     var sql = `UPDATE Property SET streetno = "${streetno}", streetname = "${streetname}", city = "${city}", state = "${state}", zipcode = "${zipcode}", sellername = "${sellername}", selleremail = "${selleremail}" where id = ${id}`

//     try {
//         var [result, fields, err] = await db.query(sql);
//         req.flash("success", "Property Updated Successfully!!!");
//         res.redirect("/")
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error", "Error occured while updating Property. Try Again Later!!!");
//         res.redirect("/");
//         return;
//     }     
    
// })

// router.get("/confirm/:id", async(req, res)=>{

//     var id = req.params.id;
//     var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`;
//     try {
//         var [rows, fields, err] = await db.query(sql);
//         res.render("property",{foundProperty:rows[0]});
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error", "Unknown Error occured . Try Again Later!!!");
//         res.redirect("/");
//         return;
//     }
// });

// router.get("/sendoffer/:id", async(req, res)=>{

//     var id = req.params.id;
//     var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`;
//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("offer",{foundProperty:result[0]});
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error", "Unknown Error occured . Try Again Later!!!");
//         res.redirect("/");
//         return;        
//     }
// });

// router.get("/sendrepairrequest/:id", async(req, res)=>{
//     var id = req.params.id;
//     var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`;
//     try {
//         var [result, fields, err] = await db.query(sql);
//         res.render("repair_request",{foundProperty:result[0]});
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error", "Unknown Error occured . Try Again Later!!!");
//         res.redirect("/");
//         return;        
//     }
// });

//=========================================================================================== 
// router.post("/sendrepairrequest/:id",upload.single("avatar"),async(req, res)=>{

//     if(req.file) {
//         var id = req.params.id;
//         var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`
//         try {
//             var[foundProperty, fields, err] = await db.query(sql);
//             var contract = req.file.path;
//             contract = contract.replace(/\\/g, "\\\\")

//             var localTime1 = new Date()
//             var nyd = new Date(localTime1);
             
//             nyd = nyd.toLocaleString('en-US', { timeZone: 'America/New_York' })
//             var nyt = nyd.substring(nyd.indexOf(',')+1);
//             nyd = nyd.split(',')[0];
//             // var nyt = nyd.substring(11);
//             // nyd = nyd.substring(0,11);
//             // nyd = nyd.replace(',', '');
            
//             var nodemailer = require('nodemailer');
//             var transporter = nodemailer.createTransport({ 
//             host: "p3plzcpnl484003.prod.phx3.secureserver.net",  
//             port: 587,
//                 auth: {
//                 user: "Donna_M@minkoffers.com",
//                 pass: 'minkoffers123'
//              },
//              tls:
//              {
//                 rejectUnauthorized:false
//              },
//             connectionTimeout: 5 * 60 * 1000, // 5 min
//             });

//             var mailOptions = {
//               from: '"MinkOffers" <Donna_M@minkoffers.com>',
//               to: 'flatfeemink@gmail.com,'+foundProperty[0].selleremail+','+req.body.agentemail,
//               subject: foundProperty[0].streetno +' '+foundProperty[0].streetname+' '+foundProperty[0].city+' '+foundProperty[0].state+ ' - Repair Request',
//               html: '<h2>'+foundProperty[0].sellername+'. You have received a repair request from agent '+req.body.agentname+ ' at '+nyt+' on  '+nyd+' .</h2> <br> Now that you have received your repair request you have to respond to the repair request within the time frame stated in the purchase contract (read your purchase contract). If you do not respond within that time frame, you are obligated to make ALL repairs listed on the repair request.<br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746 ',
//               attachments: [{
//                 filename: 'repair_request.pdf',
//                 path: req.file.path,
//                 contentType: 'application/pdf'
//               }],
//             };
//             transporter.sendMail(mailOptions, function(error, info){
//               if (error) {
//                 console.log(error);
//                 req.flash("error", 'Error: ' + error);
//                 res.redirect("/");
//               } else {
//                 console.log('Email sent: ' + info.response);
//                 console.log("Offer listing created");
//               }
//             });
//             req.flash("success", 'Repair Request has been successfully sent to Donna Mink and seller. The seller will be in touch with you soon. Please check your email for request status');
//             res.redirect("/");                                
//             return;
//             } catch(e){
//                 console.log(e);
//                 res.redirect("/");
//             }
//             return;
//     } else {
//         req.flash("error", "Please upload valid file");
//         res.redirect("/");
//     }
// })

//===========================================================================================

// router.post("/uploadcontract/:id",upload.fields([{name: 'contract'},{name:'sellerdisc'},{name:'leadbasedpaint'},{name:'preapprovalletter'},{name:'otherdocs'}]) ,async(req, res)=>{

//     if(req.files) {
//         var id = req.params.id;
//         var sql = `SELECT * FROM Property WHERE id = ${id} LIMIT 1`
//         try {
//             var[foundProperty, fields, err] = await db.query(sql);
//             var sellername = foundProperty[0].sellername
//             var agentname = req.body.agentname
//             var agentemail = req.body.agentemail
//             var agentcontact = req.body.agentcontact
//             var purchaseprice = parseInt(req.body.purchaseprice).toLocaleString();
//             var escrowamount = parseInt(req.body.escrowamount).toLocaleString();
//             var escrowfunds = req.body.escrowfunds
//             var payment = req.body.payment
//             var contingency = req.body.contingency
//             var homewarranty = req.body.homewarranty
//             var otherprovisions = req.body.otherprovisions
//             var closingdate = req.body.closingdate
//             var expirationtime = req.body.expirationtime
//             var escalation1 = req.body.escalation1
//             var escalation2 = req.body.escalation2
//             var appraisalgap = req.body.appraisalgap
//             var propertyid = foundProperty[0].id
//             var contract = req.files['contract'][0].path;
//             contract = contract.replace(/\\/g, "\\\\")
//             var sellerdisc;
//             var sellerdiscObj;
//             var leadbasedpaint;
//             var leadbasedpaintObj;
//             var preapproval;
//             var preapprovalObj;
//             var otherdocs;
//             var otherdocsObj;

//             if(escalation1 == null || escalation1== ""){
//                 escalation1 = 0;
//             } 
//             if(escalation2 == null || escalation2 == ""){
//                 escalation2 = 0
//             }
//             if(appraisalgap == null || appraisalgap == ""){
//                 appraisalgap = 0
//             }

//             escalation1 = parseInt(escalation1).toLocaleString();
//             escalation2 = parseInt(escalation2).toLocaleString();
//             appraisalgap = parseInt(appraisalgap).toLocaleString();
//             purchaseprice = purchaseprice.toLocaleString();
//             escrowamount = escrowamount.toLocaleString();

//             contingency = new Date(contingency)
//             contingency = contingency.toLocaleString('en-US')
//             contingency = contingency.split(',')[0];

//             if(req.files['sellerdisc']){
//                  sellerdisc = req.files['sellerdisc'][0].path;
//                  sellerdiscObj = {
//                     filename : 'sellerdisc.pdf',
//                     path: sellerdisc,
//                     contentType: 'application/pdf'
//                  }
//                  sellerdisc = sellerdisc.replace(/\\/g, "\\\\")
//             } else {
//                 sellerdisc = '';
//                 sellerdiscObj = {}
//             }
//             if(req.files['otherdocs']){
//                 otherdocs = req.files['otherdocs'][0].path;
//                 otherdocsObj = {
//                    filename : 'otherdocs.pdf',
//                    path: otherdocs,
//                    contentType: 'application/pdf'
//                 }
//                 otherdocs = otherdocs.replace(/\\/g, "\\\\")
//            } else {
//                 otherdocs = '';
//                 otherdocsObj = {}
//            }

//             if(req.files['leadbasedpaint']){
//                  leadbasedpaint = req.files['leadbasedpaint'][0].path;
//                  leadbasedpaintObj = {
//                     filename : 'leadbasedpaint.pdf',
//                     path: leadbasedpaint,
//                     contentType: 'application/pdf'
//                  }
//                  leadbasedpaint = leadbasedpaint.replace(/\\/g, "\\\\")
//             } else {
//                 leadbasedpaint = '';
//                 leadbasedpaintObj = {}
//             }

//             if(req.files['preapprovalletter']){
//                  preapproval = req.files['preapprovalletter'][0].path;
//                  preapprovalObj = {
//                     filename : 'preapproval.pdf',
//                     path: preapproval,
//                     contentType: 'application/pdf'
//                  }
//                  preapproval = preapproval.replace(/\\/g, "\\\\")
//             } else {
//                 preapproval = '';
//                 preapprovalObj = {}
//             }
//             var localTime1 = new Date()
//             var nyd = new Date(localTime1);
             
//             nyd = nyd.toLocaleString('en-US', { timeZone: 'America/New_York' })
            
//             // var nyt = nyd.substring(11);
//             var nyt = nyd.substring(nyd.indexOf(',')+1);
//             nyd = nyd.split(',')[0];
//             // nyd = nyd.substring(0,11);
//             // nyd = nyd.replace(',','');
//             var offercreateddate = nyd+nyt;            
//             var sql1 = `INSERT INTO Offers (sellername,agentname,agentemail,agentcontact,purchaseprice,escrowamount,escrowfunds,payment,contingency,homewarranty,otherprovisions,closingdate,expirationtime,contract,propertyid,sellerdisc,leadbasedpaint,preapproval,otherdocs,escalation1,escalation2,appraisalgap,offercreateddate) VALUES ("${sellername}","${agentname}","${agentemail}","${agentcontact}","${purchaseprice}","${escrowamount}","${escrowfunds}","${payment}","${contingency}","${homewarranty}","${otherprovisions}","${closingdate}","${expirationtime}","${contract}","${propertyid}","${sellerdisc}","${leadbasedpaint}","${preapproval}","${otherdocs}","${escalation1}","${escalation2}","${appraisalgap}","${offercreateddate}") `
//             try {
//                 var [result, fields, err] = await db.query(sql1);
//                 var nodemailer = require('nodemailer');
//                 var transporter = nodemailer.createTransport({ 
//                 host: "p3plzcpnl484003.prod.phx3.secureserver.net",  
//                 port: 587,
//                     auth: {
//                     user: "Donna_M@minkoffers.com",
//                     pass: 'minkoffers123'
//                  },
//                  tls:
//                  {
//                     rejectUnauthorized:false
//                  },
//                 connectionTimeout: 5 * 60 * 1000, // 5 min
//                 });
//                 var isKentuckyState = foundProperty[0].state;
//                 var myhtml;
//                 var pdffilename;
//                 if(isKentuckyState == "kentucky" || isKentuckyState == "Kentucky" || isKentuckyState == "Ky" || isKentuckyState == "KY" || isKentuckyState == "ky"){
//                     myhtml = '<h2>Congratulations '+foundProperty[0].sellername+'. You have received an offer from agent '+req.body.agentname+ ' at '+nyt+' on  '+nyd+' .</h2> <br> The preparer has summarized it below for you. The offer contract is included along with any supporting documents. Note, this summary may not cover all critical info in the offer contract. You should always review the offer contract in detail with professional representation before accepting the offer and signing a legally binding document. <br> <h3 style="color:blue;">Here are the terms of your contract: </h3><br><strong>Agent Name: </strong>'+req.body.agentname+'<br><strong>Agent Email: </strong>'+req.body.agentemail+'<br><strong>Agent Contact: </strong>'+req.body.agentcontact+'<br><strong>Offer price: </strong>$'+purchaseprice+'<br><strong>Escalation To: </strong>$'+escalation1+' by $'+escalation2+'<br><strong>Appraisal Gap Amount: </strong>$'+appraisalgap+'<br> <strong>Escrow amount:</strong> $'+escrowamount+'<br> <strong>Holding escrow funds:</strong> '+req.body.escrowfunds+'<br> <strong>Payment Type:</strong> '+req.body.payment+'<br><strong>Home Warranty: </strong>'+req.body.homewarranty+'<br><strong>Inspections to be completed by date: </strong>'+contingency+' <br><strong>Other Important offer considerations: </strong>'+req.body.otherprovisions+' <br><strong>Closing date / time frame:</strong> '+req.body.closingdate+'<br> <strong>Offer response time deadline:</strong> '+req.body.expirationtime+''+'<br> <h4 style="color:blue;">Please reply ALL to confirm receipt of Offer! </h4> <br> <h4 style="color:red;"> Please complete the seller agency form for EACH offer received and return to me BEFORE you begin negotiations with the buyers agent. Fill out your name and address at the top of the form, offer number and agents name, and sign at the bottom.</h4> <br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746'
//                     pdffileobj = {
//                         filename : 'Selleragency.pdf',
//                         path: 'public/selleragency.pdf',
//                         contentType: 'application/pdf'
//                     } 
//                 } else {
//                     myhtml = '<h2>Congratulations '+foundProperty[0].sellername+'. You have received an offer from agent '+req.body.agentname+ ' at '+nyt+' on  '+nyd+' .</h2> <br> The preparer has summarized it below for you. The offer contract is included along with any supporting documents. Note, this summary may not cover all critical info in the offer contract. You should always review the offer contract in detail with professional representation before accepting the offer and signing a legally binding document. <br> <h3 style="color:blue;">Here are the terms of your contract: </h3><br><strong>Agent Name: </strong>'+req.body.agentname+'<br><strong>Agent Email: </strong>'+req.body.agentemail+'<br><strong>Agent Contact: </strong>'+req.body.agentcontact+'<br><strong>Offer price: </strong>$'+purchaseprice+'<br><strong>Escalation To: </strong>$'+escalation1+' by $'+escalation2+'<br><strong>Appraisal Gap Amount: </strong>$'+appraisalgap+'<br> <strong>Escrow amount:</strong> $'+escrowamount+'<br> <strong>Holding escrow funds:</strong> '+req.body.escrowfunds+'<br> <strong>Payment Type:</strong> '+req.body.payment+'<br><strong>Home Warranty: </strong>'+req.body.homewarranty+'<br><strong>Inspections to be completed by date: </strong>'+contingency+' <br><strong>Other Important offer considerations: </strong>'+req.body.otherprovisions+' <br><strong>Closing date / time frame:</strong> '+req.body.closingdate+'<br> <strong>Offer response time deadline:</strong> '+req.body.expirationtime+''+'<br> <h4 style="color:blue;">Please reply ALL to confirm receipt of Offer! </h4> <br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746'
//                     pdffileobj = {}
//                 }
//                 var mailOptions = {
//                   from: '"MinkOffers" <Donna_M@minkoffers.com>',
//                   to: 'flatfeemink@gmail.com,'+foundProperty[0].selleremail+','+req.body.agentemail,
//                   subject: foundProperty[0].streetno +' '+foundProperty[0].streetname+' '+foundProperty[0].city+' '+foundProperty[0].state+ ' - OFFER',
//                   html: myhtml,
//                   attachments: [{
//                     filename: 'contract.pdf',
//                     path: req.files['contract'][0].path,
//                     contentType: 'application/pdf'
//                   },pdffileobj,leadbasedpaintObj,sellerdiscObj,preapprovalObj,otherdocsObj],
//                 };
//                 transporter.sendMail(mailOptions, function(error, info){
//                   if (error) {
//                     console.log(error);
//                     req.flash("error", 'Email sent: ' + error);
//                     res.redirect("/");
//                   } else {
//                     console.log('Email sent: ' + info.response);
//                     console.log("Offer listing created");
//                   }
//                 });
//                 req.flash("success", 'Offer has been successfully sent to Donna Mink and seller. The seller will be in touch with you soon. Please check your email for offer status');
//                 res.redirect("/");                                
//                 return;
//             } catch(e){
//                 console.log(e);
//                 res.redirect("/");
//             }
//             return;
//         } catch(e){
//             console.log(e);
//             res.redirect("/");
//             return;
//         }

//     } else {
//         req.flash("error", "Please upload valid contract");
//         res.redirect("/");
//     }
// })

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
            var totalclicks = 0

            var hostimage 
            // = req.files['hostimage'][0].path;
            // hostimage = hostimage.replace(/\\/g, "\\\\")
            
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
            // = req.files['propertyimage'][0].path;
            // propertyimage = propertyimage.replace(/\\/g, "\\\\")

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
            
            // var nyt = nyd.substring(11);
            var nyt = nyd.substring(nyd.indexOf(',')+1);
            nyd = nyd.split(',')[0];
            // nyd = nyd.substring(0,11);
            // nyd = nyd.replace(',','');
            var offercreateddate = nyd+nyt;            
            var sql1 = `INSERT INTO property (propertyname,squaremeters,rent,city,state,zipcode,hostname,hostemail,hosimage,propertyimage,rooms,description,propertyimage2,totalclicks,imagecaption,propertyimage3,propertyimage4,propertyimage5,propertyimage6,propertyimage7,propertyimage8,propertyimage9,propertyimage10) VALUES ("${propertyname}","${squaremeters}","${rent}","${city}","${state}","${zipcode}","${hostname}","${hostemail}","${hostimage}","${propertyimage}","${rooms}","${description}","${propertyimage2}","${totalclicks}","${imagecaption}","${propertyimage3}","${propertyimage4}","${propertyimage5}","${propertyimage6}","${propertyimage7}","${propertyimage8}","${propertyimage9}","${propertyimage10}") `
            try {
                var [result, fields, err] = await db.query(sql1);
                req.flash("success", 'Property listing has been successfully created. ');
                
                res.redirect("/show_listings");                                
                
                return;
            } catch(e){
                console.log(e);
                req.flash("error", 'Try Again Later');
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

// router.delete("/delete_user/:id", checkIfAdmin ,async(req, res)=>{

//     var id = req.params.id;
//     var sql = `DELETE FROM Users WHERE id = ${id}`
//      try {
//          var[result, fields, err] = await db.query(sql);
//          req.flash("success", "User Successfully Removed.");
//          res.redirect("/view_all_users");
//          return;
//      } catch(e){
//          req.flash("error", e);
//          res.redirect("/view_all_users");
//          return;
//      }
//  });

 // router.delete("/delete_offer/:id", checkIfAdmin ,async(req, res)=>{

 //    var offerid = req.params.id;
 //    var sql = `DELETE FROM Offers WHERE id = ${offerid}`
 //    var sql2 = `Select * from Offers WHERE id = ${offerid}`
 //    try {
 //        var[result1, fields1, err1] = await db.query(sql2);
 //        if(result1[0]){
 //            if(result1[0].contract != null && result1[0].contract !== ""){
 //                if (fs.existsSync(result1[0].contract)) {
 //                // path exists
 //                    fs.unlinkSync(result1[0].contract);
 //                }                
 //            }
 //            if(result1[0].sellerdisc != null && result1[0].sellerdisc !== "" ){
 //                if (fs.existsSync(result1[0].sellerdisc)) {
 //                    // path exists
 //                        fs.unlinkSync(result1[0].sellerdisc);
 //                    }  
 //            }
 //            if(result1[0].leadbasedpaint != null && result1[0].leadbasedpaint !== "" ){
 //                if (fs.existsSync(result1[0].leadbasedpaint)) {
 //                    // path exists
 //                        fs.unlinkSync(result1[0].leadbasedpaint);
 //                    }  
 //            }
 //            if(result1[0].preapproval != null && result1[0].preapproval !== "" ){
 //                if (fs.existsSync(result1[0].preapproval)) {
 //                    // path exists
 //                        fs.unlinkSync(result1[0].preapproval);
 //                    }  
 //            }
 //            if(result1[0].otherdocs != null && result1[0].otherdocs !== "" ){
 //                if (fs.existsSync(result1[0].otherdocs)) {
 //                    // path exists
 //                        fs.unlinkSync(result1[0].otherdocs);
 //                    }  
 //            }
 //            var[result, fields, err] = await db.query(sql);
 //            req.flash("success", "Offer Successfully Removed.");
 //            res.redirect("/viewsellers");

 //        } else {
 //            req.flash("error", "Can not delete Offer");
 //            res.redirect("back");
 //        }
 //        return;
 //    } catch(e) {
 //        console.log(e);
 //        req.flash("error", e);
 //        res.redirect("/viewsellers");
 //        return;
 //    }
 // });
 

// =========================
//  Authentication Routes
// =========================

// show register form
// router.get("/register", function(req, res) {
//     res.render("register");
// });

// handle signup logic
// router.post("/register", async(req, res)=>{
    
//     var username = req.body.username;
//     var name = req.body.name;
//     var password = req.body.password;
//     var num = req.body.num
//     var address = req.body.add;
//     var originalpassword = req.body.password;
//     var randomUser = 3003083099
//     randomUser = Math.floor(Math.random() * 1799);

//     var salt = bcrypt.genSaltSync(10);
//     password = bcrypt.hashSync(req.body.password,salt,null)

//     var sql = `INSERT INTO Users (username, name, password, address,originalpassword,initialLoginCode,isAccountVerified) VALUES ("${username}","${name}","${password}","${address}","${originalpassword}","${randomUser}","0");`
//     var sql1 = `SELECT * FROM Users Where username = "${username}" LIMIT 1`
//     try {
//         var[result, fields, err] = await db.query(sql1);
//         if(result[0]){
//             req.flash("error", "User already exist with this email. Please try different email address.");
//             res.redirect("/register");
//         } else {
//             try {
//                 var[result1, fields1, err1] = await db.query(sql);
//                 var[result2, fields2, err2] = await db.query(sql1);
//                 var nodemailer = require('nodemailer');
//                 var transporter = nodemailer.createTransport({ 
//                 host: "p3plzcpnl484003.prod.phx3.secureserver.net",  
//                 port: 587,
//                     auth: {
//                     user: "Donna_M@minkoffers.com",
//                     pass: 'minkoffers123'
//                 },
//                 tls:
//                 {
//                     rejectUnauthorized:false
//                 },
//                 connectionTimeout: 5 * 60 * 1000, // 5 min
//                 });

//                 var mailOptions = {
//                 from: '"MinkOffers" <Donna_M@minkoffers.com>',
//                 to: 'flatfeemink@gmail.com,'+result2[0].username,
//                 subject: 'Confirm your account with us at Minkoffers', 
//                 html: '<h3>Hello '+result2[0].name+'. We have received an account registration request from you at Minkoffers. </h3> <br>Please click on the link below to confirm your account.<br><br> <a href="https://www.minkoffers.com/confirm_user/'+result2[0].id+'/'+randomUser+'">https://www.minkoffers.com/confirm_user/'+result2[0].id+'/'+randomUser+'</a><br><br>If this was not from you, please reply to this email. <br>Thank You.<br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746 '

//                 //   attachments: [{
//                 //     filename: 'repair_request.pdf',
//                 //     path: req.file.path,
//                 //     contentType: 'application/pdf'
//                 //   }],
//                 };
//                 transporter.sendMail(mailOptions, function(error, info){
//                 if (error) {
//                     console.log(error);
//                     req.flash("error", 'Error: ' + error);
//                     res.redirect("/");
//                 } else {
//                     console.log('Email sent: ' + info.response);
//                     console.log("Account Openning Email Sent.");
//                 }
//                 });
//                 req.flash("success","Please follow the instruction on your email address to confirm your account.")
//                 res.redirect("/login");
//                 // passport.authenticate("user")(req, res, function(){
//                 //     req.flash("success", "Welcome to Mink Realty " + req.body.name);    
//                 //     res.redirect("/");
//                 // });
//                 return;
//             } catch(e){
//                 console.log(e);
//                 res.redirect("/register");
//                 return;
//             }

//         }
        
//         return;
//     } catch(e){
//         req.flash("error", e);
//         res.redirect("/");
//         return;
//     }
// });

// router.get("/confirm_user/:userid/:randomcode",  async(req, res) => {
//     var userid = req.params.userid;
//     var randomcode = req.params.randomcode;

//     var sql = `Update Users set isAccountVerified = 1 Where id = "${userid}" and initialLoginCode = "${randomcode}"`
//     var sql1 = `Select * from Users where id = "${userid}" and initialLoginCode = "${randomcode}"`
//     try {
//         var[result, fields, err] = await db.query(sql);
//         var[result1, fields1, err1] = await db.query(sql1);
//         if(result1[0]){
//             req.flash("success","Your account is confirmed. Please login to continue.");
//             res.redirect("/login")
//         } else {
//             req.flash("error","Something is wrong with this link. Please try again with correct link.");
//             res.redirect("/login")
//         }
//         return;
//     } catch(e) {
//         console.log(e);
//         req.flash("error","An unknown error occurred. Please try again later.")
//         res.redirect("/login");
//         return;
//     }
// });

// // Show login form
// router.get("/login", function(req, res) {
//     res.render("login"); 
// });

// Show login form
router.get("/admin_login", function(req, res) {
    res.render("admin_login"); 
});
// Show login form
// router.get("/forgot_password", function(req, res) {
//     res.render("forgot_password"); 
// });
// router.get("/change_password", function(req, res) {
//     res.render("change_password"); 
// });
// router.get("/request_password", function(req, res) {
//     res.render("request_password"); 
// });

// /request_new_password
// router.post("/request_new_password", async(req, res) => {
//     var email = req.body.username;

//     var sql = `SELECT * FROM Users WHERE username = "${email}" LIMIT 1`
//     try {
//         var [result, fields, err] = await db.query(sql);
//         if(result[0]){
//             var nodemailer = require('nodemailer');
//             var transporter = nodemailer.createTransport({ 
//             host: "p3plzcpnl484003.prod.phx3.secureserver.net",  
//             port: 587,
//                 auth: {
//                 user: "Donna_M@minkoffers.com",
//                 pass: 'minkoffers123'
//              },
//              tls:
//              {
//                 rejectUnauthorized:false
//              },
//             connectionTimeout: 5 * 60 * 1000, // 5 min
//             });

//             var mailOptions = {
//               from: '"MinkOffers" <Donna_M@minkoffers.com>',
//               to: 'flatfeemink@gmail.com,'+result[0].username,
//               subject: 'Password Reset Request From '+result[0].name,
//               html: '<h3>Hello '+result[0].name+'. We have received a password reset request from you. </h3> <br>We will reset your password against this email address and get back to you shortly. If this was not from you, please reply to this email. <br>Thank You.<br><br>Mink Realty LLC<br>Donna Mink, Broker<br>Flatfeemink.com<br>502-727-1746 '
//             //   attachments: [{
//             //     filename: 'repair_request.pdf',
//             //     path: req.file.path,
//             //     contentType: 'application/pdf'
//             //   }],
//             };
//             transporter.sendMail(mailOptions, function(error, info){
//               if (error) {
//                 console.log(error);
//                 req.flash("error", 'Error: ' + error);
//                 res.redirect("/");
//               } else {
//                 console.log('Email sent: ' + info.response);
//                 console.log("Password Reset Request Sent");
//               }
//             });
//             req.flash("success", 'Password Reset Request has been successfully sent to Donna Mink. We will be in touch with you soon. Please check your email for request status');
//             res.redirect("/");
//         } else {
//            req.flash("error","please enter valid email address!!")
//            res.redirect("/request_password") 
//         }
//         return;
//     } catch(e){
//         console.log(e);
//         req.flash("error",e);
//         res.redirect("/request_password")
//         return;
//     }

// })

// router.put("/change_password",async(req, res)=>{
    
//     var email = req.body.username;
//     var password = req.body.password
//     var password1 = req.body.password1
//     var password2 = req.body.password2
//     if(password1===password2) {
//         var salt = bcrypt.genSaltSync(10);
//         password1 = bcrypt.hashSync(req.body.password1,salt,null)
    
//         var sql = `UPDATE Users SET password = "${password1}", originalpassword = "${password2}" where username = "${email}" and originalpassword = "${password}"`
//         var sql1 = `Select * from Users where username = "${email}" and originalpassword = "${password}"`
//         try {
//             var [result, fields, err] = await db.query(sql1);
//             if(result[0]){
//                 var [result1, fields1, err1] = await db.query(sql);
//                 try{
//                     req.flash("success", "Your Password is Updated Successfully!!!");
//                     res.redirect("/login")
//                     return                
//                 } catch(e){
//                     console.log(e);
//                     req.flash("error", "Incorrect username or password. Please try again!!");
//                     res.redirect("/login");
//                     return;
//                 }
//             } else {
//                 req.flash("error", "Incorrect username or password. Please try again!!");
//                 res.redirect("/change_password");
//             }
//             return;
//         } catch(e){
//             console.log(e);
//             req.flash("error", "Error occured while updating Password. Try Again Later!!!");
//             res.redirect("/change_password");
//             return;
//         }
//     } else {
//         req.flash("error","Your new password does not match confirm password. Please try again!");
//         res.redirect("/change_password")
//     }

    
// })


// Handle login logic
// router.post("/login",passport.authenticate("user", {
//     successRedirect: "/",
//     failureRedirect: "/login"
// }) ,function(req, res) {
    
// });


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