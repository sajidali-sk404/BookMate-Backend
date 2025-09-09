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

// VERIFY EMAIL (POST)
// POST /api/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { email: rawEmail, code: rawCode } = req.body || {};
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : rawEmail;
    const code = typeof rawCode === "string" ? rawCode.trim() : String(rawCode || "");

    console.log("VERIFY EMAIL request (normalized):", { email, code });

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    console.log("Found user:", !!user, "user._id:", user?._id);

    if (!user) return res.status(400).json({ message: "User not found" });

    // log stored types / values
    console.log("Stored verificationCode (raw):", user.verificationCode, "type:", typeof user.verificationCode);
    console.log("Stored codeExpiry (raw):", user.codeExpiry, "type:", typeof user.codeExpiry, "now:", Date.now());

    const storedCode = user.verificationCode != null ? String(user.verificationCode).trim() : null;

    if (!storedCode) {
      return res.status(400).json({ message: "No verification code found. Please request a new code." });
    }

    if (storedCode !== code) {
      console.log("CODE MISMATCH -> sent:", code, "stored:", storedCode);
      return res.status(400).json({ message: "Invalid code" });
    }

    if (user.codeExpiry && Date.now() > Number(user.codeExpiry)) {
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
    user.codeExpiry = Date.now() + 10*60*1000;
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
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!existingUser.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const authClaims = {
      name: existingUser.email,
      role: existingUser.role,
      id: existingUser._id,
    };

    const token = jwt.sign({ authClaims }, process.env.JWT_SECRET || "bookrecommend123", {
      expiresIn: "30d",
    });

    return res.status(200).json({
      id: existingUser._id,
      role: existingUser.role,
      token,
    });
  } catch (error) {
    console.error("signin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// get-user-information
router.get("/get-user-information", authenthicateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user id missing in token" });
    }

    // select explicit fields to avoid leaking private info
    const user = await User.findById(userId)
      .select("-password -verificationCode -codeExpiry -__v")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    console.error("get-user-information error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// update-address
router.put("/update-address", authenthicateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user id missing in token" });
    }

    const { address } = req.body;
    if (typeof address !== "string" || address.trim().length === 0) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { address: address.trim() },
      { new: true, runValidators: true, context: "query" } // return updated doc
    ).select("-password -verificationCode -codeExpiry -__v");

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Address updated successfully", user: updated });
  } catch (error) {
    console.error("update-address error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
