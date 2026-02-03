const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: Number,
        required: true
    },
    members: {
        type: [String],
        required: true,
        validate: {
            validator: arr => arr.length <= 3,
            message: 'Max 3 members allowed'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
