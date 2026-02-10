const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
    }, 
    currentRound: {
        type: String,
        enum: ['deadlock', 'crack-the-code', 'eliminated'],
        default: 'deadlock'
    },
    deadlockResult: {
        type: String,
        enum: ['pending', 'win', 'lose'],
        default: 'pending'
    },
    currentQuestionIndex: {
    type: Number,
    default: 0
},

    questions: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeadlockQuestion"
        }
]


}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
