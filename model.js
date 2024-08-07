const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    firstname : {
        type : String, 
        required : true
    },
    lastname : {
        type : String, 
        required : true
    },
    teleId : {
        type : String,
        required : true
    },

    isBot : {
        type : Boolean ,
        default : false 
    }
},{timestamps: true})

const User =  mongoose.model('User',userSchema)
module.exports = User