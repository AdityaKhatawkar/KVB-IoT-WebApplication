const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("../utils/email");

// helper to sign JWT
function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
}



// Register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, state, city } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, phone and password" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
      return res.status(400).json({ message: "Email already in use" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone)
      return res.status(400).json({ message: "Phone already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      location: {
        // state: state || null,
        // city: city || null,
        state: req.body.location.split(",")[0].trim(),
        city: req.body.location.split(",")[1].trim(),
      },
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (allow email or phone)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier is email or phone
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: "Please provide identifier and password" });

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    user.lastActive = new Date();
    await user.save();

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastActive: user.lastActive,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if email was provided
    if (!email) {
      return res.status(400).json({ message: "Please provide your email" });
    }

    // 2. Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 3. Check if the email exists in DB
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether email exists (security best practice)
      return res.status(200).json({
        message: "If that email is registered you will receive a reset link",
      });
    }

    // 4. Generate password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // 5. Create reset link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // 6. Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      res.json({ message: "Password reset link sent to email" });
    } catch (emailErr) {
      // Cleanup if email sending fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error(emailErr);
      res.status(500).json({ message: "Error sending email" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!token) return res.status(400).json({ message: "Invalid token" });
    if (!password)
      return res.status(400).json({ message: "Please provide a new password" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Token is invalid or has expired" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const jwtToken = signToken(user);
    res.json({ message: "Password reset successful", token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
