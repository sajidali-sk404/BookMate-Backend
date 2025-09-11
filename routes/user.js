// routes/auth.js
require("dotenv").config(); // ensure loaded if this file runs standalone
const router = require("express").Router();
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { authenthicateToken } = require("./userAuth"); // make sure spelling matches export

// Helper to send verification email
const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // optional: verify transporter
    // await transporter.verify();

    await transporter.sendMail({
      from: `"Book App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      text: `Your verification code is ${code}. It will expire in 10 minutes.`,
    });
  } catch (err) {
    // rethrow so caller can handle/log
    throw err;
  }
};

// SIGNUP
router.post("/sign-up", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (username.length < 4) {
      return res.status(400).json({ message: "Username should be greater than 3 characters" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters" });
    }

    const hashPass = await bcrypt.hash(password, 10);

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    const newUser = new User({
      username,
      email,
      password: hashPass,
      address,
      isVerified: false,
      verificationCode: code,
      codeExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    await newUser.save();

    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
      // consider deleting the user or marking for resend flow — but still return success to avoid leaking info
      return res.status(500).json({ message: "Failed to send verification email. Try again later." });
    }

    return res.status(200).json({ message: "Sign up successful. Check your email for verification code." });
  } catch (error) {
    console.error("signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// POST /api/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(200).json({ message: "Email already verified." });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

    if (user.codeExpiry < Date.now()) {
      return res.status(400).json({ message: "Code expired" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.codeExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    console.error("verify-email error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.codeExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, code);
    return res.status(200).json({ message: "Verification code resent" });
  } catch (err) {
    console.error("resend-code error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// SIGNIN
router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // 2. Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Check email verification
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before login." });
    }

    // 4. Create JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Send response
    return res.json({
      message: "Login successful",
      token,
      role: user.role?.trim(),
      id: user._id,
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// get-user-information
router.get("/get-user-information", authenthicateToken, async (req, res) => {
  try {
    const { id } = req.headers; // ✅ use "id" (same as you store in localStorage)

    const user = await User.findById(id)
      .select("-password -verificationCode -codeExpiry -__v")
      .lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error("get-user-information error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// update-address
router.put("/update-address", authenthicateToken, async (req, res) => {
  try {
    const { id } = req.headers; // ✅ keep it consistent
    if (!id) {
      return res.status(401).json({ message: "Unauthorized: user id missing in headers" });
    }
   
    const { address } = req.body;
    if (typeof address !== "string" || address.trim().length === 0) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { address: address.trim() },
      { new: true, runValidators: true, context: "query" }
    ).select("-password -verificationCode -codeExpiry -__v");

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Address updated successfully",
      user: updated,
    });
  } catch (error) {
    console.error("update-address error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;
