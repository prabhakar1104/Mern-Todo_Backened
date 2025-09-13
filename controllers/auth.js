const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/userSchema");
const { sendEmail } = require("../utils/emailService");
const JWT_SECRET = "Prabhakar1104";
const pendingRegistrations = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const authController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      // Check if email already exists
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Generate OTP and hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store registration data temporarily
      pendingRegistrations.set(email, {
        hashedPassword,
        otp,
        otpExpiry,
      });

      // Send verification email
      const emailSent = await sendEmail(
        email,
        "Verify Your Email",
        `Your OTP is: ${otp}. Valid for 10 minutes.`
      );

      if (!emailSent) {
        pendingRegistrations.delete(email);
        return res
          .status(500)
          .json({ message: "Failed to send verification email" });
      }

      res.json({ message: "Please check your email for verification OTP" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, otp } = req.body;
      console.log("Received verification request:", { email, otp });

      // Get pending registration
      const pendingUser = pendingRegistrations.get(email);
      if (!pendingUser) {
        console.log("No pending registration found for:", email);
        return res.status(404).json({
          message: "Registration request not found or expired",
        });
      }

      console.log("Comparing OTPs:", {
        received: otp,
        stored: pendingUser.otp,
      });

      // Convert both to strings for comparison
      if (otp.toString() !== pendingUser.otp.toString()) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (new Date() > pendingUser.otpExpiry) {
        pendingRegistrations.delete(email);
        return res.status(400).json({ message: "OTP expired" });
      }

      // Create user in database
      const user = await UserModel.create({
        email,
        password: pendingUser.hashedPassword,
        isVerified: true,
      });

      // Clear pending registration
      pendingRegistrations.delete(email);

      res.json({ message: "Email verified successfully. You can now login." });
    } catch (err) {
      console.error("Email verification error:", err);
      res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.isVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email first" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.json({ token });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = {
        code: otp,
        expiry: otpExpiry,
      };
      await user.save();

      const emailSent = await sendEmail(
        email,
        "Reset Password",
        `Your password reset OTP is: ${otp}. Valid for 10 minutes.`
      );

      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send reset email" });
      }

      res.json({ message: "Please check your email for password reset OTP" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.otp || !user.otp.code) {
        return res.status(400).json({ message: "No OTP request found" });
      }

      if (user.otp.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      if (new Date() > user.otp.expiry) {
        return res.status(400).json({ message: "OTP expired" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.otp = undefined;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  },
};

module.exports = authController;
