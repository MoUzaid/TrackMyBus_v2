const User = require('../Models/UserModel');

const authAdmin = async (req, res, next) => {
    try {
        const id = req.user.id;  
        const user = await User.findById(id);

        if (!user || user.role === 0) { 
            return res.status(403).json({ msg: "Admin Resources Access Denied" });
        }
       if(user.role === 1){
       console.log("Admin Access Granted");
       }
        next();
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

module.exports = authAdmin;
