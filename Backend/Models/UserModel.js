const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    busId:{
        type:Number,
        required:true
    },
    enroll: {
        type: Number,
        required: true,
        unique: true,
        maxLength: 10,
    },
    pickupLocation:{
        type:String,
        required:true,
    },
    course: { 
        type: String, 
        required: true 
    },
    year: { 
        type: Number, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    fcmTokens: {
    type: [String], // array of strings
    default: [],    // default empty array
  },
    role: {
        type: Number,
        enum: [0, 1],   
        default: 0    
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("Student", userSchema);

module.exports = User;
