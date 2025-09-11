const mongoose = require("mongoose")


const book = new mongoose.Schema(
    {
        url: {
            type: String,
        },

        title: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        genre: {
            type: String,
            required: true,
        },

        desc: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['Fiction', 'Non-fiction'],
            required: true,
        },
        recommended: {
            type: Boolean,
             default: false,
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Book", book)