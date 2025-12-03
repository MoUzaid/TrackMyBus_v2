const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
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
    busId: {
        type: Number,
        required: true
    },
    busNo: {
        type: String,   
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,   
        required: true,
        unique: true,
        maxLength: 10,
    },
    password: { 
        type: String, 
        required: true 
    },

    role: {
        type: String,
        default: "driver"  
    },

    createdAt: {
        type: Date,
        default: Date.now 
    }
});

const Driver = mongoose.model("Driver", driverSchema);

module.exports = Driver;
