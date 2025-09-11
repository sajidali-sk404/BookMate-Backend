const mongoose = require("mongoose")

const review = new mongoose.Schema({
    bookId: {
        type: mongoose.Types.ObjectId,
        ref: "Book",
    },

    reviewerName: {
        type: String,
        required: true,
    },


    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },


    comment: {
        type: String,
    },
}, { timestamps: true }
)

module.exports = mongoose.model("review", review)