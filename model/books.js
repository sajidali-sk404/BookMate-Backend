const mongoose = require("mongoose")


const book = new mongoose.Schema(
    {
        url: {
            type: String,
        },

        title: {
            type: String,
            require: true,
        },
        author: {
            type: String,
            require: true,
        },

        genre: {
            type: String,
            require: true,
        },

        desc: {
            type: String,
            require: true,
        },
        category: {
            type: String,
            enum: ['Fiction', 'Non-fiction'],
            required: true
        },
        recommended: {
            type: Boolean, default: false
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("books", book)