const mongoose = require('mongoose');

const deadlockMatchSchema = new mongoose.Schema({
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    tugPosition: {
        type: Number,
        default: 0   
    },
    maxPull: {
        type: Number,
        default: 5   // win condition
    },
    status: {
        type: String,
        enum: ['lobby', 'ongoing', 'finished'],
        default: 'lobby'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('DeadlockMatch', deadlockMatchSchema);
