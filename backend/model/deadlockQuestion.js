const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema(
    {
        input: {
            type: String
        },
        output: {
            type: String
        },
        isHidden: {
            type: Boolean,
            default: false
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

    category: {
        type: String,
        enum: ["Arrays", "Strings", "Loops", "HashMaps", "Logic"],
        default: "Logic"
    },

    className: {
        type: String,
        default: "Solution"
    },

    functionName: {
        type: String,
        required: true
    },

    parameters: {
        python: { type: String, required: true },
        cpp: { type: String, required: true },
        java: { type: String, required: true }
    },

    templates: {
        python: { type: String, required: true },
        cpp: { type: String, required: true },
        java: { type: String, required: true }
    },

    testCases: {
        type: [testCaseSchema],
        required: true,
        validate: v => v.length >= 3 // 1 visible + 2 hidden
    }
}, { timestamps: true });

module.exports = mongoose.model("DeadlockQuestion", deadlockQuestionSchema);
