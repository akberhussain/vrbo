// var mongoose = require ("mongoose");
// var bcrypt = require("bcrypt-nodejs");

// var passportLocalMongoose = require("passport-local-mongoose");

// var userSchema = new mongoose.Schema({
    
//     username: { type: String, required: true, index: { unique: true }},
//     name: String,
//     password: { type: String, required: true },
//     num: String,
//     address: String
// });

// userSchema.pre('save',function(next){
//   var user = this;
//      if (!user.isModified('password')) return next();
//       bcrypt.genSalt(10,function(err,salt){
    
//     if(err) return next(err);
//     bcrypt.hash(user.password,salt,null,function(err,hash){
//       if(err) return next(err)
//       user.password = hash;
//       next();
//     })
//   })
// });
  
// userSchema.methods.comparePassword = function(password){
//     return bcrypt.compareSync(password,this.password);
//     //Return either True or False
// }
// userSchema.plugin(passportLocalMongoose);
// module.exports = mongoose.model("User", userSchema);