const Driver = require('../Models/DriverModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail");



const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const driverCtrl = {
      getAllDriver: async (req, res) => {
    try {
        const drivers = await Driver.find().select('-password');
        res.json(drivers);
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},
    registerDriver: async (req, res) => {
        try {
            console.log(req.body);
            const { name, email, busId, busNo, phoneNumber, password } = req.body;

            const existingDriver = await Driver.findOne({ email });
            if (existingDriver) return res.status(400).json({ msg: "Driver email already exists." });

            const hashedPassword = await bcrypt.hash(password, 10);

            const newDriver = new Driver({
                name,
                email,
                busId,
                busNo,
                phoneNumber,
                password: hashedPassword
            });

            await newDriver.save();

            const accessToken = createAccessToken({ id: newDriver._id });
            const refreshToken = createRefreshToken({ id: newDriver._id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/driver/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            const driverResponse = newDriver.toObject();
            delete driverResponse.password;

            return res.status(201).json({ msg: "Driver registered successfully", accessToken, driver: driverResponse });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    loginDriver: async (req, res) => {
        try {
            const { email, password } = req.body;
            const driver = await Driver.findOne({ email });
            if (!driver) return res.status(400).json({ msg: "Driver does not exist" });

            const matched = await bcrypt.compare(password, driver.password);
            if (!matched) return res.status(400).json({ msg: "Incorrect password" });

            const accessToken = createAccessToken({ id: driver._id });
            const refreshToken = createRefreshToken({ id: driver._id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/driver/refresh_token',
            });

            return res.json({ msg: 'Driver logged in successfully', accessToken, driver });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if (!rf_token) return res.status(400).json({ msg: "No refresh token provided" });

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, driver) => {
                if (err) return res.status(403).json({ msg: "Invalid or expired refresh token" });

                const accessToken = createAccessToken({ id: driver.id });
                return res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    logoutDriver: async (req, res) => {
        try {
            res.clearCookie('refreshToken', { path: '/driver/refresh_token' });
            return res.json({ msg: "Driver logged out" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    getDriver: async (req, res) => {
        try {
            const driver = await Driver.findById(req.driver.id).select('-password');
            if (!driver) return res.status(404).json({ msg: "Driver not found" });

            return res.json(driver);
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
    updateBusId:async(req,res)=>{
        try{
  const { busId, busNo} = req.body;
  const driver = await Driver.findByIdAndUpdate(req.driver.id,{busId:busId,busNo:busNo},{new:true});
    if(!driver) return res.status(404).json({msg:"Driver not found"});
    return res.json({msg:"Bus details updated successfully",driver});
        }
        catch(err){
            return res.status(500).json({msg:err.message});
        }
    },
forgotPassword: async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const driver = await Driver.findOne({ email });
    if (!driver) return res.status(404).json({ msg: "Driver not found" });

    const resetToken = jwt.sign(
      { id: driver._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `https://track-my-bus-v2.vercel.app/reset-password-driver/${resetToken}`; 
    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Hi ${driver.name},</p>
       <p>You requested to reset your password. Click the link below:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>This link will expire in 15 minutes.</p>`
    );

    return res.json({ msg: "Password reset email sent" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
},

    resetPassword:async (req, res) => {
        try{
    const { token, newPassword } = req.body;
console.log(token,newPassword);
    if (!token) return res.status(400).json({ msg: "No token provided" });
    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
        if (!decoded) return res.status(400).json({ msg: "Invalid or expired token" });
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await Driver.findByIdAndUpdate(decoded.id, { password: passwordHash });

    return res.json({ msg: "Password reset successful" });
}catch (err) {
    return res.status(400).json({ msg: "Invalid or expired token" });
  }
}
};

module.exports = driverCtrl;
