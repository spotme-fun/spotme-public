let mongoose = require('mongoose');

let pinsSchema = new mongoose.Schema({
    lat: {type:Number, required:true},
    lng: {type:Number, required:true},
    title: {type:String, required:true},
    icon: {type:String, required:true},
    color: {type:String, required:true},
    notes: {type:String, required:true},// html of the openable window
    notesStyle:{type:String, required:true},
    date: {type:Date, required:false, immutable:true, default:Date.now},
});

module.exports= mongoose.model('semistaticpin',pinsSchema,'semistaticpin');