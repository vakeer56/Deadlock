const mongoose = require("mongoose");

const crackCodeSubmissionSchema = new mongoose.Schema({
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
    submittedLogic: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        default: false,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model(
    "CrackCodeSubmission",
    crackCodeSubmissionSchema
);
