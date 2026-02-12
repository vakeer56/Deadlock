const mongoose = require('mongoose');

const deadlockMatchSchema = new mongoose.Schema({
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    tugPosition: {
        type: Number,
        default: 0
    },
    maxPull: {
        type: Number,
        default: 10   // win condition
    },
    scoreA: {
        type: Number,
        default: 0
    },
    scoreB: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['lobby', 'ongoing', 'finished'],
        default: 'lobby'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeadlockQuestion'
    }],
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    loser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    pullHistory: [{
        type: String,
        enum: ['A', 'B']
    }]


}, { timestamps: true });

module.exports = mongoose.model('DeadlockMatch', deadlockMatchSchema);
