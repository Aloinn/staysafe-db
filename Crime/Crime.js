// User.JS
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = require('mongoose').Types.ObjectId;

var CrimeSchema = new Schema({
  latitude: {
    type: Number,
    required: [true, "Location required"]
  },
  longitude: {
    type: Number,
    required: [true, "Location required"]
  },
  crime: {
    type: String,
    required: [true, "Crime required"]
  }
})

// PROMISE GET DETAILS
CrimeSchema.statics.getPromise = (params) =>{
  return new Promise((resolve, reject)=>{
    Crime.findOne(params,(err,user)=>{
      if(err) {reject(err)}
    })
  })
}

var Crime = mongoose.model('Crime', CrimeSchema);
module.exports = Crime
