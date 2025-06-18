const jwt = require('jsonwebtoken');
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

// Function to sign JWT token
function signToken(payload, options){
    return jwt.sign(payload, JWT_SECRET, options);
}   

// Function to verify JWT token
function verifyToken(token) {
    try{
        return jwt.verify(token, JWT_SECRET);
    } catch(err){
        console.error("Error in verify token: ", err.message)
        return null;
    }
}

// Middelware to valid session
function checkSessionAccess(req, res, next) {
    token = req.cookies.authToken;
    if (!token){
        return res.status(401).json({message: "Unauthorized access"});
    }
    const decoded = verifyToken(token);
    if (!decoded){
        return res.status(401).json({message: "Invalid or Expired session"});
    }
    req.user = decoded;
    next();
}

module.exports = { signToken, verifyToken, checkSessionAccess };   