const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busId: {
    type: Number,
    required: true
  },
  busNo: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
  },

  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  endLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  pickupPoints: [
    {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bus = mongoose.model("Bus", busSchema);
module.exports = Bus;
