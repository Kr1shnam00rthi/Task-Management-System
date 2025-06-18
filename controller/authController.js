const bcrypt = require('bcrypt');
const { db } = require("../config/dbConfig");
const { signToken, verifyToken } = require("../middleware/auth");
const { sendOTP, verifyOTP } = require("../middleware/otp");

// POST /api/auth/login 
async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password){
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const [userDetails] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (userDetails.length === 0){
            return res.status(400).json({ success: false, message: "Invalid email" });
        }
        
        const isValidPassword = await bcrypt.compare(password, userDetails[0].password);
        if (!isValidPassword){
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        const payload = { email: email };
        const options = { expiresIn: "12h" } 
        const token = signToken(payload, options);

        res.cookie("authToken", token, {
            httpOnly: true,       
            secure: true,         
            sameSite: "Strict"
        });

        return res.status(200).json({ success: true, message: "Logged in successfully"});

    } catch(err){
        console.error("Error in login:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/register
async function register(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const [userDetails] = await db.query("SELECT email FROM users WHERE email = ?", [email]);
        if (userDetails.length > 0){
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        await sendOTP(email);

        const payload = { email: email, password: await bcrypt.hash(password, 10)}
        const options = { expiresIn: "6m" };
        const token = signToken(payload, options);

        return res.status(200).json({ success: true, message: "OTP sent successfully", userToken: token });

    } catch(err){
        console.error("Error in register:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/verify
async function verify(req, res) {
    const { otp, userToken } = req.body;
    if (!otp || !userToken) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const decoded = verifyToken(userToken);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const { email, password } = decoded;

        const isValidOtp = await verifyOTP(email, otp);
        
        if (!isValidOtp){
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
        }

        await db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);

        return res.status(200).json({ success: true, message: "User created successfully" });

    } catch(err){
        console.error("Error in verify:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/forgot-password
async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email){
        return res.status(400).json({ success: false, message: "Missing email" });
    }
    try {
        const [userDetails] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (userDetails.length === 0){
            return res.status(400).json({ success: false, message: "User not found" })
        }

        await sendOTP(email);

        return res.status(200).json({ success: true, message: "OTP sent successfully" });

    } catch(err){
        console.error("Error in forgotPassword:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;
    if ( !email || !otp || !newPassword ){
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const isValidOtp = await verifyOTP(email, otp);
        if (!isValidOtp){
            return res.status(400).json({ success: false, message: "Invalid or Expired OTP" });
        }   

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE users SET password = ? WHERE email = ?", [passwordHash, email]);

        return res.status(200).json({ success: true, message: "Password reset successfully" });

    } catch(err){
        console.error("Error in resetPassword:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/change-password
async function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword){
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    try {
        const [userDetails] =  await db.query("SELECT password FROM users WHERE email = ?", [req.user.email]);
        
        const isValidPassword = await bcrypt.compare(oldPassword, userDetails[0].password);
        if (!isValidPassword){
            return res.status(400).json({ success: false, message: "Invalid old password" });
        }

        const newPasswordhash = await bcrypt.hash(newPassword, 10);
        
        await db.query("UPDATE users SET password = ? WHERE email = ?", [newPasswordhash, req.user.email]);

        return res.status(200).json({ success: true, message: "Password changed successfully" });

    } catch(err){
        console.error("Error in changePassword:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/auth/logout
async function logout(req, res) {
    try {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (err) {
        console.error("Error in logout:", err.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = { login, register, verify, forgotPassword, resetPassword, changePassword, logout };  