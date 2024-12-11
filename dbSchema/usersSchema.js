let mongoose = require('mongoose');


let userSchema = new mongoose.Schema({
    userName: {type:String, required:true},
    password: {type:String, required:true},
    myPins:{type:Array, required:false},
    email: {type:String, required:true},
    phoneNumber: {type:String, required:false},
    accountCreated: {type:Date, required:true, immutable:true, default:Date.now},
    lastActive: {type:Date, required:true, default:Date.now},
    name: {
        firstname: {type:String, required:true},
        surname: {type:String, required:true}
    },
    level:{type:Number, required:true, default:0},
    xp:{type:Number, required:true, default:0},

});


module.exports= mongoose.model('user',userSchema,'user')