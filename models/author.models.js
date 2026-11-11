const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;