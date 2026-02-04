const mongoose = require("mongoose");

const crackCodeAttemptSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true,
    },
    crackCodeSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CrackCodeSession",
        required: true,
    },
    input: {
        type: String,
        required: true,
    },
    output: {
        type: String,
        required: true,
    },
    attemptNumber: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model(
    "CrackCodeAttempt",
    crackCodeAttemptSchema
);
