const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth');

authRouter.post('/register', authController.register);
authRouter.post('/verify-email', authController.verifyEmail);
authRouter.post('/login', authController.login);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);

module.exports = authRouter;