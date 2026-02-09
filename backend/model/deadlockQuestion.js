const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
    {
    input: {
        type: String,
        required: true
    },
    output: {
        type: String,
        required: true
    }
    },
    { _id: false }
);

const deadlockQuestionSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true
    },

    description: {
    type: String,
    required: true
    },

    difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
    },

    testCases: {
    type: [testCaseSchema],
    required: true,
    validate: v => v.length > 0
    }
});

module.exports = mongoose.model("DeadlockQuestion", deadlockQuestionSchema);
