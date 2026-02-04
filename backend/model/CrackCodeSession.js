const mongoose = require("mongoose");

const crackCodeSessionSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
    },
    attemptsUsed: {
        type: Number,
        default: 0,
    },
    maxAttempts: {
        type: Number,
        default: 50,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: {
        type: Date,
        default: null,
    },
});

module.exports = mongoose.model(
    "CrackCodeSession",
    crackCodeSessionSchema
);
