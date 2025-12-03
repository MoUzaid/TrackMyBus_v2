const User = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require("../utils/sendEmail");


const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

const userCtrl={
  getAllUser: async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},
    getUser: async (req, res) => {
    try {
        const user1 = await User.findById(req.user.id).select('-password');
        if (!user1) return res.status(404).json({ msg: "User not found" });
        return res.json(user1); 
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},

registerUser: async (req, res) => { 
    try {
        let { name, email, busId, enroll, pickupLocation, course, year, password } = req.body;

       
        if (pickupLocation) {
            pickupLocation = pickupLocation.toUpperCase();  
        }

        const user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "The email already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            busId,
            enroll,
            pickupLocation, 
            course,
            year,
            password: hashedPassword
        });
        await newUser.save();

        const accessToken = createAccessToken({ id: newUser._id });
        const refreshToken = createRefreshToken({ id: newUser._id });

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  path: "/user/refresh_token",
  secure: false,     
  sameSite: "lax",     
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            msg: "User registered successfully",
            accessToken,
            user: userResponse,
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
},

refreshToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if (!rf_token) return res.status(400).json({ msg: "No refresh token provided" });

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(403).json({ msg: "Invalid or expired refresh token" });

                const accessToken = createAccessToken({ id: user.id }); 
                return res.json({ accessToken });
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(400).json({ msg: "User does not exist" });

            const matched = await bcrypt.compare(password, user.password);
            if (!matched) return res.status(400).json({ msg: "Incorrect password" });

            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = createRefreshToken({ id: user._id });

          res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  path: "/user/refresh_token",
  secure: false,       
  sameSite: "lax",     
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

            return res.json({ msg: 'Logged In successfully', accessToken, user });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    logout: async (req, res) => {
        try {
          console.log("Logout endpoint hit");
            res.clearCookie('refreshToken', { path: '/user/refresh_token' });
            return res.json({ msg: "Logged Out" });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
forgotPassword: async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "15m" }
    );
  console.log(email);
    const resetLink = `https://track-my-bus-v2.vercel.app/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Password Reset Request",
      `<p>Hi ${user.name},</p>
       <p>Click below to reset your password:</p>
       <a href="${resetLink}">${resetLink}</a>
       <p>This link will expire in 15 minutes.</p>`
    );

    return res.json({ msg: "Password reset email sent" });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
},
  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token) return res.status(400).json({ msg: "No token provided" });

      const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
      if (!decoded) return res.status(400).json({ msg: "Invalid or expired token" });

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await User.findByIdAndUpdate(decoded.id, { password: passwordHash });

      return res.json({ msg: "Password reset successful" });
    } catch (err) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }
  },
  fcmToken: async (req, res) => {
    const { userId, token } = req.body;
    try{
      if (!userId || !token) {
        return res.status(400).json({ msg: "User ID and token are required" });
      }
      const user = await User.findById(userId);
      if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }
    res.json({ success: true });
  } 
  catch (err) {
    return res.status(500).json({ msg: err.message });
  }
}
}


module.exports = userCtrl;