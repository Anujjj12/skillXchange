const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode =String(Math.floor(100000 + Math.random() * 900000));

    user = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,
    });

    console.log(user);

    await user.save();
    await sendEmail(
      email,
      "Verify Your Email",
      `Your verification code is: ${verificationCode}`
    );

    res
      .status(200)
      .json({ message: "Verification email sent.", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;
    console.log("userId:", userId);
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    console.log("User verificationCode:", user.verificationCode);
    console.log("Received verificationCode:", verificationCode);

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
