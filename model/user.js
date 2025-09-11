// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,   // normalize for consistent queries
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: false,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      set: v => v.trim()
    },

    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book", // <-- ensure this matches your Book model name
      },
    ],

    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book", // <-- ensure this matches your Book model name
      },
    ],

    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // <-- ensure this matches your Order model name
      },
    ],

    // Verification fields (required by your /verify-email logic)
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String, // store as string (or hashed string if you choose to hash)
      default: null,
    },

    codeExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
