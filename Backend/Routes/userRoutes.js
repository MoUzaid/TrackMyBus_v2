const express = require('express');
const router = express.Router();
const userCtrl = require('../Controllers/userCtrl');
const auth = require('../middlewares/authUser');
const authAdmin = require("../middlewares/authAdmin");

router.get('/info',auth, userCtrl.getUser);
router.post('/register', userCtrl.registerUser);
router.post('/login', userCtrl.login);
router.get('/logout', userCtrl.logout);
router.post("/forgot-password", userCtrl.forgotPassword);
router.post("/reset-password", userCtrl.resetPassword);
router.get("/refresh_token", userCtrl.refreshToken);
router.post('/save-fcm-token',userCtrl.fcmToken);
router.get("/all_users",auth,authAdmin,userCtrl.getAllUser);

module.exports = router;   
