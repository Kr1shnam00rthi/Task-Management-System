const bcrypt = require('bcrypt');
const { sendMail } = require('./mail');
const { db } = require("../config/dbConfig");

// Function to generate OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to send and store OTP
async function sendOTP(email) {
    try {
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        const subject = "User Verification";
        const message = `OTP for user verification: ${otp}\nOTP valid for 5 minutes`;

        await sendMail(email, subject, message);

        await db.query(`INSERT INTO otps (email, otp, created_at) VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE otp = VALUES(otp), created_at = NOW();`,
            [email, otpHash]
        );

    } catch (err) {
        console.error("Error in sendOTP:", err.message);
    }
}

// Funcito to verify OTP
async function verifyOTP(email, otp) {
    try {
        const [otpDetails] = await db.query(`SELECT otp FROM otps WHERE email = ? AND created_at > NOW() - INTERVAL 5 MINUTE`,
            [email]
        );

        if (otpDetails.length === 0) return false;

        const isValid = await bcrypt.compare(otp.toString(), otpDetails[0].otp);
        if (!isValid) return false;

        await db.query("DELETE FROM otps WHERE email = ?", [email]);
        return true;

    } catch (err) {
        console.error("Error in verifyOTP:", err.message);
        return false;
    }
}

module.exports = { sendOTP, verifyOTP };
