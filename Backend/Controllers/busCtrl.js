const Bus = require("../Models/BusModel");

const busCtrl = {
    createBus: async (req, res) => {
    try {
      const { busId, busNo, capacity, startLocation, endLocation, pickupPoints } = req.body;
      const existingBus = await Bus.findOne({ busNo });
      if (existingBus) {
        return res.status(400).json({ msg: "Bus number already exists" });
      }

      const newBus = new Bus({
        busId,
        busNo,
        capacity,
        startLocation, 
        endLocation,   
        pickupPoints   
      });

      await newBus.save();

      return res.status(201).json({ msg: "Bus created successfully", bus: newBus });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },


  getAllBuses: async (req, res) => {
    try {
      const buses = await Bus.find();
      return res.json(buses);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getBusById: async (req, res) => {
    try {
      const { busId } = req.params;

      const bus = await Bus.findOne({ busId:busId });

      if (!bus) return res.status(404).json({ msg: "Bus not found" });
      return res.json(bus);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  updateBus: async (req, res) => {
    try {
      const { busId, busNo, capacity, startLocation, endLocation, pickupPoints } = req.body;

      const bus = await Bus.findByIdAndUpdate(
        req.params.id, 
        { busId, busNo, capacity, startLocation, endLocation, pickupPoints },
        { new: true }
      );

      if (!bus) return res.status(404).json({ msg: "Bus not found" });
      return res.json({ msg: "Bus updated successfully", bus });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteBus: async (req, res) => {
    try {
      console.log("Delete Bus ID:", req.params.id); // Debug log
      const bus = await Bus.findByIdAndDelete(req.params.id); 
      if (!bus) return res.status(404).json({ msg: "Bus not found" });
      return res.json({ msg: "Bus deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  }
};

module.exports = busCtrl;
