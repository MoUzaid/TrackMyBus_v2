const express = require("express");
const router = express.Router();
const busCtrl = require("../Controllers/busCtrl");
const authAdmin = require("../middlewares/authAdmin");
const authUser = require("../middlewares/authUser");

router.post("/create",authUser,authAdmin, busCtrl.createBus);       
router.get("/buses", busCtrl.getAllBuses);      
router.get("/:busId", busCtrl.getBusById);    
router.put("/:busId",authUser,authAdmin, busCtrl.updateBus);     
router.delete("/delete/:id",authUser,authAdmin, busCtrl.deleteBus);  

module.exports = router;
