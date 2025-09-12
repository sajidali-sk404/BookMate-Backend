const mongoose = require("mongoose")


const order = new mongoose.Schema(
   {
      user: {
         type: mongoose.Types.ObjectId,
         ref: "User",
      },

      books: [
         {
            type: mongoose.Types.ObjectId,
            ref: "Book", // ✅ must match your Book model name
         }
      ],

      status: {
         type: String,
         default: "Order placed",
         enum: ["Order placed", "Out for delivery", "Delivered", "Canceled"]
      },
   },
   { timestamps: true }
)

module.exports = mongoose.model("Order", order)