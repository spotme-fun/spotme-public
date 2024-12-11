let mongoose = require('mongoose');

let pinsSchema = new mongoose.Schema({
        creator:{type:String, required:true},
        lat: {type:Number, required:false},
        lng: {type:Number, required:false},
        title: {type:String, required:true},
        icon: {type:String, required:true},
        notes: {type:String, required:false},//a text not a html template 
        date: {type:Date, required:true, immutable:true, default:Date.now, index: { expires: '2h' }, },
});


module.exports= mongoose.model('carpin',pinsSchema, 'carpin');