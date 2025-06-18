const express = require("express");
const authRouter = express.Router();
const authController = require("../controller/authController");
const { checkSessionAccess } = require("../middleware/auth");

authRouter.post('/login', authController.login);
authRouter.post('/register', authController.register);
authRouter.post('/verify', authController.verify);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.post('/change-password', checkSessionAccess, authController.changePassword);
authRouter.post('/logout', checkSessionAccess, authController.logout);

module.exports = authRouter;